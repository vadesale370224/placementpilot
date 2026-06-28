"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { api } from "@/lib/api";
import { speakText, startAudioRecording } from "@/lib/speech";

interface QuestionTemplate {
  number: number;
  question: string;
  expectedKeywords: string[];
}

const TOPICS = [
  "Industrial Electrician",
  "MIG/TIG Welder",
  "Retail Sales Associate",
  "Customer Support Executive",
  "Delivery Partner"
];

const QUESTIONS_DB: Record<string, Record<string, QuestionTemplate[]>> = {
  en: {
    "Industrial Electrician": [
      { number: 1, question: "Explain how you check a circuit for voltage before starting maintenance work.", expectedKeywords: ["tester", "voltage", "safety"] },
      { number: 2, question: "What is your lock-out/tag-out (LOTO) procedure?", expectedKeywords: ["loto", "breaker", "tag"] }
    ],
    "MIG/TIG Welder": [
      { number: 1, question: "What safety precautions do you take when performing MIG welding on heavy metal structures?", expectedKeywords: ["helmet", "ventilation", "earth"] },
      { number: 2, question: "How do you prevent welding defects like porosity or cracking?", expectedKeywords: ["clean", "angle", "speed"] }
    ],
    "Retail Sales Associate": [
      { number: 1, question: "How do you handle a customer who disputes a billing charge at the cash counter?", expectedKeywords: ["receipt", "calm", "manager"] },
      { number: 2, question: "What would you do if you noticed stock levels for a key product were extremely low?", expectedKeywords: ["inventory", "report", "stock"] }
    ],
    "Customer Support Executive": [
      { number: 1, question: "Describe a time when you solved a complex problem for a caller under pressure.", expectedKeywords: ["listen", "database", "solved"] },
      { number: 2, question: "How do you manage hold times when looking up consumer records?", expectedKeywords: ["permission", "quick", "explain"] }
    ],
    "Delivery Partner": [
      { number: 1, question: "How do you handle delays in parcel delivery due to heavy traffic or route navigation issues?", expectedKeywords: ["maps", "customer", "call"] },
      { number: 2, question: "What safety steps do you take when driving in poor weather conditions?", expectedKeywords: ["slow", "helmet", "cautious"] }
    ]
  },
  hi: {
    "Industrial Electrician": [
      { number: 1, question: "मेंटेनेंस का काम शुरू करने से पहले आप सर्किट में वोल्टेज की जांच कैसे करते हैं?", expectedKeywords: ["टेस्टर", "वोल्टेज", "सेफ्टी"] },
      { number: 2, question: "आपकी लॉक-आउट/टैग-आउट (LOTO) प्रक्रिया क्या है?", expectedKeywords: ["लोटो", "ब्रेकर", "टैग"] }
    ],
    "MIG/TIG Welder": [
      { number: 1, question: "भारी धातु संरचनाओं पर एमआईजी (MIG) वेल्डिंग करते समय आप क्या सुरक्षा सावधानियां बरतते हैं?", expectedKeywords: ["फेसशील्ड", "हवा", "अर्थिंग"] },
      { number: 2, question: "वेल्डिंग में सरंध्रता (porosity) या क्रैकिंग जैसी कमियों को आप कैसे रोकते हैं?", expectedKeywords: ["सफाई", "गैस", "दबाव"] }
    ],
    "Retail Sales Associate": [
      { number: 1, question: "यदि कोई ग्राहक कैश काउंटर पर बिल चार्ज को लेकर विवाद करता है, तो आप उसे कैसे संभालते हैं?", expectedKeywords: ["रसीद", "शांत", "मैनेजर"] },
      { number: 2, question: "यदि कोई प्रमुख उत्पाद का स्टॉक बहुत कम हो, तो आप क्या करेंगे?", expectedKeywords: ["इन्वेंटरी", "रिपोर्ट", "स्टॉक"] }
    ],
    "Customer Support Executive": [
      { number: 1, question: "किसी ऐसे समय का वर्णन करें जब आपने दबाव में किसी कॉल करने वाले के लिए एक जटिल समस्या का समाधान किया हो।", expectedKeywords: ["सुनना", "सिस्टम", "मदद"] },
      { number: 2, question: "ग्राहक की जानकारी ढूंढते समय आप होल्ड टाइम को कैसे मैनेज करते हैं?", expectedKeywords: ["अनुमति", "जल्दी", "विवरण"] }
    ],
    "Delivery Partner": [
      { number: 1, question: "भारी ट्रैफिक या नेविगेशन समस्या के कारण पार्सल डिलीवरी में देरी होने पर आप इसे कैसे संभालते हैं?", expectedKeywords: ["रास्ता", "ग्राहक", "फ़ोन"] },
      { number: 2, question: "खराब मौसम में ड्राइविंग करते समय आप क्या सुरक्षा उपाय करते हैं?", expectedKeywords: ["धीमे", "हेलमेट", "सावधानी"] }
    ]
  },
  mr: {
    "Industrial Electrician": [
      { number: 1, question: "मेंटेनन्सचे काम सुरू करण्यापूर्वी तुम्ही सर्किटमधील व्होल्टेज कसे तपासता?", expectedKeywords: ["टेस्टर", "व्होल्टेज", "सेफ्टी"] },
      { number: 2, question: "तुमची लॉक-आउट/टैग-आउट (LOTO) प्रक्रिया काय आहे?", expectedKeywords: ["लोटो", "ब्रेकर", "टॅग"] }
    ],
    "MIG/TIG Welder": [
      { number: 1, question: "मेटल स्ट्रक्चर्सवर एमआयजी (MIG) वेल्डिंग करताना तुम्ही कोणती काळजी घेता?", expectedKeywords: ["हेल्मेट", "व्हेंटिलेशन", "अर्थिंग"] },
      { number: 2, question: "वेल्डिंगमध्ये दोष (porosity) टाळण्यासाठी तुम्ही काय कराल?", expectedKeywords: ["स्वच्छ", "गॅस", "दाब"] }
    ],
    "Retail Sales Associate": [
      { number: 1, question: "जर एखाद्या ग्राहकाने बिलाबाबत कॅश काउंटरवर वाद घातला, तर तुम्ही त्याला कसे हाताळाल?", expectedKeywords: ["बिल", "शांत", "मॅनेजर"] },
      { number: 2, question: "एखाद्या महत्त्वाच्या वस्तूचा साठा खूप कमी असल्यास तुम्ही काय कराल?", expectedKeywords: ["इन्व्हेंटरी", "नोंद", "स्टॉक"] }
    ],
    "Customer Support Executive": [
      { number: 1, question: "अशा प्रसंगाचे वर्णन करा जेव्हा तुम्ही दबावाखाली असताना कॉल करणाऱ्या ग्राहकाची समस्या सोडवली.", expectedKeywords: ["ऐकणे", "सिस्टम", "सोडवले"] },
      { number: 2, question: "सिस्टममध्ये माहिती शोधताना तुम्ही होल्ड टाइम कसा व्यवस्थापित करता?", expectedKeywords: ["परवानगी", "लवकर", "स्पष्ट"] }
    ],
    "Delivery Partner": [
      { number: 1, question: "ट्रॅफिक किंवा मार्ग नेव्हिगेशन समस्येमुळे पार्सल डिलिव्हरीला उशीर होत असल्यास तुम्ही काय कराल?", expectedKeywords: ["मार्ग", "ग्राहक", "कॉल"] },
      { number: 2, question: "खराब हवामानात गाडी चालवताना तुम्ही कोणती सुरक्षितता बाळगता?", expectedKeywords: ["हळू", "हेल्मेट", "काळजी"] }
    ]
  }
};

const FEEDBACK_DATABASE: Record<string, Record<string, {
  transcript: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  detailedFeedback: string;
}>> = {
  mr: {
    "Industrial Electrician": {
      transcript: "व्होल्टेज तपासण्यासाठी मी नेहमी आधी सर्किट बंद करतो आणि डिजिटल मल्टीमीटर किंवा टेस्ट लॅम्प वापरून खात्री करतो की लाईट पूर्णपणे बंद आहे. काम सुरू करण्यापूर्वी मी लॉक-आउट/टॅग-आउट (LOTO) नियम पाळतो आणि ब्रेकर लॉक करतो जेणेकरून कोणीही चुकून विद्युत प्रवाह चालू करू नये. मी रबरी हातमोजे आणि सुरक्षित बूट नेहमी वापरतो.",
      score: 90,
      strengths: ["LOTO सुरक्षा नियमांचे अत्यंत अचूक वर्णन केले आहे.", "मल्टीमीटर आणि टेस्ट लॅम्पच्या वापराची माहिती स्पष्ट आहे.", "वैयक्तिक सुरक्षा उपकरणांचा (PPE) योग्य उल्लेख केला आहे."],
      weaknesses: ["व्होल्टेज तपासणीच्या टप्प्यांमध्ये अर्थिंग पडताळणीचा अधिक तपशील जोडता येईल."],
      detailedFeedback: "उत्कृष्ट तांत्रिक उत्तर! तुम्ही औद्योगिक सुरक्षेचे सर्व मूलभूत नियम स्पष्ट केले आहेत. मुलाखतकाराला आकर्षित करण्यासाठी तुम्ही आधी हाताळलेल्या एखाद्या मोठ्या ३-फेज इलेक्ट्रिकल पॅनेल दुरुस्तीच्या अनुभवाचा छोटा उल्लेख करू शकता."
    },
    "MIG/TIG Welder": {
      transcript: "वेल्डिंग करताना मी नेहमी वेल्डिंग हेल्मेट आणि सेफ्टी जॅकेट वापरतो. धातू स्वच्छ करण्यासाठी मी ग्राइंडर आणि वायर ब्रशने गंज किंवा तेल साफ करतो, कारण स्वच्छता नसेल तर वेल्डिंगमध्ये पोकळी (porosity) निर्माण होते. मी वेल्डिंग गनचा कोन ७० ते ८० अंशात ठेवतो आणि गॅस फ्लो योग्य सेट करतो जेणेकरून एअर बबल्स तयार होणार नाहीत.",
      score: 88,
      strengths: ["वेल्ड मधील डिफेक्ट्स (porosity) टाळण्यासाठी स्वच्छतेच्या महत्त्वाची चांगली जाणीव आहे.", "गनचा कोन आणि गॅस फ्लोच्या तांत्रिक बाजू स्पष्ट केल्या आहेत."],
      weaknesses: ["TIG वेल्डिंग मधील फिलर मेटलच्या वापरावर थोडे अधिक स्पष्टीकरण देऊ शकता."],
      detailedFeedback: "वेल्डिंगच्या कामातील तुमचे तांत्रिक कौशल्य आणि सुरक्षेची काळजी उत्तरातून स्पष्ट दिसते. पुढील सरावात TIG आणि MIG वेल्डिंगमधील वेगाच्या नियंत्रणाचा संदर्भ जोडा."
    },
    "Retail Sales Associate": {
      transcript: "कॅश काउंटरवर जर ग्राहकाने बिलाबाबत वाद घातला, तर मी सर्वप्रथम शांत राहतो आणि त्यांचे म्हणणे नीट ऐकून घेतो. मी कॉम्प्युटर सिस्टीममध्ये बिल आणि मालाची पडताळणी करतो. काही चूक असल्यास मी दिलगिरी व्यक्त करून मॅनेजरच्या मदतीने लगेच बदल करतो. महत्त्वाच्या वस्तूचा साठा कमी असल्यास मी इन्व्हेंटरी सिस्टीममध्ये नोंद करतो आणि टीमला कळवून लगेच मालाची ऑर्डर देतो.",
      score: 85,
      strengths: ["ग्राहकांच्या तक्रारी शांतपणे ऐकण्याची उत्तम वृत्ती दाखवली आहे.", "स्टॉक कमी झाल्यावर सिस्टीम वापरून त्वरित ऑर्डरीची नोंद घेण्याचे स्पष्ट केले."],
      weaknesses: ["विवादाच्या वेळी कंपनी पॉलिसीनुसार रिफंड/एक्सचेंजचे नियम सांगण्यास सुधारणा हवी."],
      detailedFeedback: "छान ग्राहक सेवा दृष्टिकोन आहे. उत्तर आणखी मजबूत करण्यासाठी ग्राहकांना व्यस्त न ठेवता कॅश काउंटरवरील वेग कसा सरावाने वाढवू शकता यावर भर द्या."
    },
    "Customer Support Executive": {
      transcript: "दबावाखाली ग्राहक बोलत असताना मी नेहमी सक्रियपणे ऐकतो आणि त्याला खात्री देतो की आम्ही त्यांची मदत करू. मी सिस्टीम डेटाबेसमध्ये त्यांची माहिती शोधतो. सिस्टीम सर्च करताना मी ग्राहकाला होल्डवर ठेवण्यासाठी आधी नम्रपणे परवानगी घेतो आणि स्पष्ट सांगतो की मला माहिती शोधायला १ ते २ मिनिटे लागतील. माहिती मिळाल्यावर मी लगेच समस्या सोडवून ग्राहकाचे समाधान करतो.",
      score: 87,
      strengths: ["एक्टिव्ह लिसनिंग (सक्रियपणे ऐकणे) चे उत्कृष्ट दर्शन.", "होल्डवर ठेवण्यापूर्वी परवानगी घेण्याचे आणि वेळेचे नियोजन योग्य स्पष्ट केले."],
      weaknesses: ["कठीण ग्राहकांना हाताळण्याच्या उदाहरणात 'प्रॉब्लेम सॉल्व्हिंग' तंत्र अजून स्पष्ट हवे."],
      detailedFeedback: "उत्कृष्ट संवाद कौशल्य! तुमचा मराठी भाषेतील सूर अत्यंत विनम्र आणि व्यावसायिक आहे. विविध कॉलिंग टूल्स (CRM) च्या नावासह उत्तरात जोड दिल्यास मुलाखतकारावर चांगला प्रभाव पडेल."
    },
    "Delivery Partner": {
      transcript: "पार्सल वितरणाला उशीर झाल्यास मी नेव्हिगेशन मॅपवर पर्यायी रस्ते शोधतो. पण जास्त उशीर होणार असेल तर मी लगेच ग्राहकाला कॉल करून नम्रपणे माहिती देतो. गाडी चालवताना मी वेगाचे नियंत्रण ठेवतो आणि खराब हवामानात हेल्मेट तसेच रेनकोट घालून अत्यंत काळजीपूर्वक आणि हळू गाडी चालवतो. कधीही घाईगडबडीत चुकीच्या बाजूने ओव्हरटेक करत नाही.",
      score: 86,
      strengths: ["कर्णधार ग्राहकाला वेळेत माहिती देण्याला प्राधान्य दिले आहे.", "खराब हवामानात सुरक्षित ड्रायव्हिंगचे नियम पाळण्यास कटिबद्धता."],
      weaknesses: ["पार्सल सुरक्षेबद्दल (पाण्यापासून संरक्षण) बोलणे अधिक सुधारा."],
      detailedFeedback: "तुमचे संवाद आणि सुरक्षेविषयीचे उत्तर चांगले आहे. डिलिव्हरी पार्टनर म्हणून मार्ग नियोजनासाठी तुम्ही मोबाईल ॲप्स कसे वापरता याचे अधिक तांत्रिक उदाहरणे समाविष्ट करा."
    }
  },
  hi: {
    "Industrial Electrician": {
      transcript: "वोल्टेज की जांच करने के लिए मैं सबसे पहले सर्किट की पावर सप्लाई बंद करता हूं और डिजिटल मल्टीमीटर या नियॉन टेस्टर से सुनिश्चित करता हूं कि कोई करंट नहीं है। मैं लॉक-आउट/टैग-आउट (LOTO) नियम का पालन करता हूं और ब्रेकर बॉक्स पर लाल टैग लगाता हूं। काम करते समय इन्सुलेटेड दस्ताने और सेफ्टी शूज पहनना अनिवार्य है।",
      score: 92,
      strengths: ["LOTO सुरक्षा प्रोटोकॉल की बहुत स्पष्ट और सटीक जानकारी दी।", "डिजिटल मल्टीमीटर और नियॉन टेस्टर का सही उपयोग समझाया।", "सुरक्षा उपकरणों (PPE) के प्रति जागरूकता।"],
      weaknesses: ["वोल्टेज जांचते समय अर्थ-टू-फेज टेस्टिंग के बारे में अतिरिक्त जानकारी दे सकते हैं।"],
      detailedFeedback: "आपका जवाब बहुत ही पेशेवर है। औद्योगिक विद्युत सुरक्षा नियमों की अच्छी समझ है। अपने उत्तर को और बेहतर बनाने के लिए किसी 3-फेज मोटर पैनल की समस्या निवारण का उदाहरण शामिल करें।"
    },
    "MIG/TIG Welder": {
      transcript: "एमआईजी वेल्डिंग करते समय सबसे पहले मैं अपनी वेल्डिंग हेलमेट, चमड़े के दस्ताने और एप्रन पहनता हूं। वेल्डिंग करने वाली जगह को अच्छी तरह से साफ करना जरूरी है ताकि जंग, तेल या नमी न रहे, नहीं तो वेल्डिंग कमजोर होगी। मैं वेल्डिंग गन का एंगल 75 डिग्री रखता हूं और गैस प्रेशर चेक करता हूं ताकि पोरोसिटी न आए।",
      score: 88,
      strengths: ["वेल्ड डिफेक्ट्स से बचने के लिए साफ-सफाई के महत्व को रेखांकित किया।", "सटीक गन एंगल और गैस शील्डिंग प्रेशर का उल्लेख किया।"],
      weaknesses: ["अलग-अलग धातुओं (जैसे स्टील बनाम एल्युमिनियम) की सेटिंग्स का उल्लेख करने की आवश्यकता है।"],
      detailedFeedback: "सुरक्षा और वेल्डिंग तकनीकों का अच्छा ज्ञान है। इंटरव्यू में वेल्ड बीड्स की फिनिशिंग और स्लैग रिमूवल के बारे में भी बताएं."
    },
    "Retail Sales Associate": {
      transcript: "कैश काउंटर पर अगर कोई ग्राहक बिल को लेकर विवाद करता है, तो मैं शांत रहकर मुस्कुराते हुए उनकी बात सुनता हूं। मैं सिस्टम में उनके आइटम चेक करता हूं। अगर कोई त्रुटि है, तो माफी मांगकर बिल को ठीक करता हूं और आवश्यकता पड़ने पर स्टोर मैनेजर की मदद लेता हूं। स्टॉक कम होने पर मैं तुरंत इन्वेंटरी सिस्टम में एंट्री करता हूं ताकि समय पर री-स्टॉक हो सके।",
      score: 86,
      strengths: ["दबाव में भी शांत रहकर ग्राहक की समस्या सुलझाने का रवैया बेहतरीन है।", "स्टॉक आउट होने से पहले इन्वेंटरी अपडेट करने का सही तरीका स्पष्ट किया।"],
      weaknesses: ["विवाद समाधान में कंपनी की एक्सचेंज पॉलिसी का जिक्र कर सकते थे।"],
      detailedFeedback: "आपका व्यवहार और दृष्टिकोण रिटेल जॉब के लिए बहुत अच्छा है। काउंटर पर ग्राहकों की कतार को तेजी से संभालने के बारे में भी बात करें."
    },
    "Customer Support Executive": {
      transcript: "कॉल पर जब कोई परेशान ग्राहक होता है, तो मैं उनकी बात पूरे ध्यान से सुनता हूं और आश्वासन देता हूं कि समस्या का समाधान होगा। मैं सिस्टम में उनकी डिटेल्स ढूंढता हूं। डिटेल्स सर्च करते समय होल्ड पर रखने के लिए ग्राहक से विनम्रतापूर्वक अनुमति लेता हूं। समस्या का निवारण कर उन्हें पूरी जानकारी देता हूं।",
      score: 89,
      strengths: ["विनम्रता और एक्टिव लिसनिंग (सक्रिय रूप से सुनना) का उत्कृष्ट प्रयोग।", "होल्ड प्रोटोकॉल का सही तरीके से पालन किया।"],
      weaknesses: ["कठिन कॉल्स को संभालने के लिए प्रयुक्त टूल्स (जैसे CRM) का विवरण बढ़ा सकते हैं।"],
      detailedFeedback: "सच्चे और प्रभावी कम्युनिकेशन स्किल्स। हिंदी में आपका उच्चारण और लहजा बहुत अच्छा है। ग्राहकों की संतुष्टि बढ़ाने वाले अन्य फैक्टर्स भी जोड़ें."
    },
    "Delivery Partner": {
      transcript: "पार्सल डिलीवरी में ट्रैफिक या अन्य वजहों से देरी होने पर मैं जीपीएस मैप्स पर दूसरा रास्ता देखता हूं और कस्टमर को कॉल करके सूचित करता हूं कि मुझे पहुंचने में कितना समय लगेगा। खराब मौसम में हेलमेट पहनकर वाहन की स्पीड धीमी रखता हूं और सुरक्षित ड्राइविंग को प्राथमिकता देता हूं।",
      score: 87,
      strengths: ["कस्टमर को तुरंत अपडेट देने का अच्छा दृष्टिकोण।", "खराब मौसम में स्पीड लिमिट और सेफ्टी हेलमेट का अनिवार्य उपयोग।"],
      weaknesses: ["रास्ते में पार्सल के डैमेज प्रोटेक्शन के बारे में अधिक बता सकते हैं।"],
      detailedFeedback: "एक सुरक्षित और जिम्मेदार डिलीवरी पार्टनर का नजरिया। कस्टमर रेटिंग्स और ऐप के उपयोग का उल्लेख उत्तर में और मजबूती लाएगा."
    }
  },
  en: {
    "Industrial Electrician": {
      transcript: "Before beginning maintenance, I isolate the power source and verify using a calibrated multimeter or neon tester to ensure zero voltage. I follow the Lock-Out/Tag-Out (LOTO) protocols by securing the breaker switch with my lock. I always wear electrical-rated insulated gloves and steel-toe safety shoes.",
      score: 93,
      strengths: ["Comprehensive details on zero-voltage verification.", "Correct execution sequence of LOTO protocols.", "Focus on personal protective equipment (PPE)."],
      weaknesses: ["Could mention specific electrical standards or arc flash boundaries."],
      detailedFeedback: "Exceptional explanation! Your safety-first mindset is perfect for industrial plants. To shine further, share a brief experience troubleshooting high-voltage control systems."
    },
    "MIG/TIG Welder": {
      transcript: "For welding, I prep the metal surface by grinding away rust, mill scale, and grease to prevent weld porosity. I verify gas shield pressure settings and maintain a 75-degree travel angle. I always wear a high-grade auto-darkening welding helmet, flame-resistant jacket, and heavy leather gauntlets.",
      score: 89,
      strengths: ["Thorough awareness of joint contamination causing porosity.", "Precise mention of physical gun angle and gas flow."],
      weaknesses: ["Did not mention filler wire gauge selection or weld inspections (NDT)."],
      detailedFeedback: "Solid welding technical foundation. In real interviews, mention visual inspections and carbon arc gouging procedures if relevant."
    },
    "Retail Sales Associate": {
      transcript: "If a customer disputes a charge, I remain polite and check the barcode scanner logs in our POS terminal. I review the transaction invoice and offer a refund or exchange according to store policy. When stock runs low, I log it in the ERP inventory system to alert the procurement manager.",
      score: 87,
      strengths: ["Calm de-escalation posture at the billing counter.", "Strong understanding of digital inventory logs and replenishment."],
      weaknesses: ["Could explicitly mention how to handle multi-customer queues during disputes."],
      detailedFeedback: "Very good service mindset. Try to mention cross-selling techniques or loyalty program sign-ups you handle during cashiering."
    },
    "Customer Support Executive": {
      transcript: "When dealing with an frustrated customer, I active-listen, validate their concern, and search their ticket records. When checking data, I always ask the caller's permission before putting them on hold and explain that it will take 1-2 minutes. I resolve the issue and summarize the steps taken.",
      score: 90,
      strengths: ["Strong empathy and validation skills.", "Excellent hold etiquette and queue control."],
      weaknesses: ["Could highlight CRM ticketing tool names like Salesforce or Zendesk."],
      detailedFeedback: "Superb voice modulation and clarity. To stand out, discuss your average handle time (AHT) and customer satisfaction (CSAT) track records."
    },
    "Delivery Partner": {
      transcript: "If I encounter route delays, I use map navigation to reroute. If still delayed, I proactively call the customer to explain the ETA. During bad weather, I drive at low speeds, wear my safety helmet, and ensure the parcel container is sealed waterproof.",
      score: 88,
      strengths: ["Proactive customer alert approach.", "High awareness of road safety and defensive driving in rains."],
      weaknesses: ["Could expand on package custody security and delivery app logs."],
      detailedFeedback: "Very practical and customer-friendly. Highlight how you coordinate with hubs for bulk deliveries or express dispatches."
    }
  }
};

export default function InterviewCoachPage() {
  const t = useTranslations("coach");
  const locale = useLocale();
  const router = useRouter();

  const [recordingStopFn, setRecordingStopFn] = useState<(() => void) | null>(null);
  
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [profile, setProfile] = useState<any | null>(null);
  const [passport, setPassport] = useState<any | null>(null);

  // Check speech recognition capability
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSpeechSupported(false);
      }
    }
  }, []);

  const [sessionActive, setSessionActive] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("Industrial Electrician");

  const [questions, setQuestions] = useState<QuestionTemplate[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  
  const [transcript, setTranscript] = useState("");
  const [sessionFeedback, setSessionFeedback] = useState<{
    score: number;
    strengths: string[];
    weaknesses: string[];
    detailedFeedback: string;
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getProfile();
        if (!res || !res.profile || !res.passport) {
          router.push("/onboarding");
          return;
        }
        setProfile(res.profile);
        setPassport(res.passport);
      } catch (err) {
        console.error("Coach profile load error:", err);
        router.push("/onboarding");
      }
    }
    loadData();
  }, [router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setInterval(() => setDuration(prev => prev + 1), 1000);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDuration(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const handleStartSession = () => {
    const topicQuestions = (QUESTIONS_DB[locale] || QUESTIONS_DB["en"])[selectedTopic];
    setQuestions(topicQuestions);
    setCurrentQuestionIndex(0);
    setSessionActive(true);
    setSessionFeedback(null);
    setTranscript("");

    setTimeout(() => {
      speakText(topicQuestions[0].question, locale);
    }, 500);
  };

  const handleSpeakQuestion = () => {
    if (questions[currentQuestionIndex]) {
      speakText(questions[currentQuestionIndex].question, locale);
    }
  };

  const handleStartRecording = async () => {
    try {
      const recorder = await startAudioRecording(() => {
        setIsRecording(false);
        setTranscribing(true);
        simulateTranscription();
      });
      setRecordingStopFn(() => recorder.stop);
      setIsRecording(true);
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      alert(errMsg);
    }
  };

  const handleStopRecording = () => {
    if (recordingStopFn) {
      recordingStopFn();
    }
  };

  const handleSubmitTypedAnswer = () => {
    if (!typedAnswer.trim()) return;
    simulateTranscription(typedAnswer.trim());
    setTypedAnswer("");
  };

  const simulateTranscription = async (customTranscript?: string) => {
    setTranscribing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setTranscribing(false);

    const localeDb = FEEDBACK_DATABASE[locale] || FEEDBACK_DATABASE["en"];
    const topicDb = localeDb[selectedTopic] || FEEDBACK_DATABASE["en"]["Industrial Electrician"];

    const finalTranscript = customTranscript || topicDb.transcript;

    setTranscript(finalTranscript);
    setSessionFeedback({
      score: topicDb.score,
      strengths: topicDb.strengths,
      weaknesses: topicDb.weaknesses,
      detailedFeedback: topicDb.detailedFeedback
    });

    const readFeedback = locale === 'hi'
      ? `अभ्यास पूरा हुआ। आपका साक्षात्कार प्रदर्शन स्कोर ${topicDb.score} प्रतिशत है।`
      : locale === 'mr'
      ? `अभ्यास पूर्ण झाला. तुमचा मुलाखत कामगिरी स्कोर ${topicDb.score} टक्के आहे.`
      : `Practice complete. Your interview performance score is ${topicDb.score} percent.`;
    speakText(readFeedback, locale);
  };

  const handleFinishPractice = async () => {
    if (!profile || !passport || !sessionFeedback) return;

    try {
      await api.saveInterviewSession({
        topic: selectedTopic,
        feedback: sessionFeedback,
        transcript: transcript,
      });

      const newScore = Math.min(100, parseFloat((passport.readinessScore + 10.0).toFixed(1)));
      alert(locale === 'hi' 
        ? `साक्षात्कार सत्र सफलतापूर्वक सहेज लिया गया है! आपका तत्परता स्कोर (Readiness Score) बढ़कर ${newScore}% हो गया है।` 
        : locale === 'mr' 
        ? `मुलाखत सत्र यशस्वीरित्या जतन केले आहे! तुमचा रेडीनेस स्कोअर वाढून ${newScore}% झाला आहे.` 
        : `Interview session successfully saved! Your Readiness Score in Skill Passport has increased to ${newScore}%.`
      );
      
      setSessionActive(false);
      router.push("/passport");
    } catch (err: any) {
      alert("Failed to save interview session: " + err.message);
    }
  };

  if (!profile) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#060212] text-gray-900 dark:text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 animate-fadeIn">
          {/* Header */}
          <div className="border-b border-gray-250/50 dark:border-violet-950/20 pb-6">
            <h1 className="text-3xl font-black bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
              {t("title")}
            </h1>
            <p className="text-gray-550 dark:text-gray-400 mt-1 font-semibold text-sm">
              {t("subtitle")}
            </p>
          </div>

          {/* Session Setup View */}
          {!sessionActive ? (
            <div className="max-w-2xl glass-panel rounded-3xl p-8 space-y-6 shadow-xl animate-fadeIn">
              <div className="flex flex-col gap-3">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest font-mono">
                  {t("selectTopic")}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {TOPICS.map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => setSelectedTopic(topic)}
                      className={`p-5 text-left border rounded-2xl transition duration-300 font-bold text-sm cursor-pointer ${
                        selectedTopic === topic
                          ? "border-violet-500 bg-gradient-to-br from-violet-50 to-blue-50/50 dark:from-violet-950/20 dark:to-blue-950/20 text-violet-600 dark:text-violet-400 shadow-sm"
                          : "border-gray-200 dark:border-gray-850 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStartSession}
                className="w-full py-4 bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 hover:from-violet-750 hover:to-cyan-600 text-white font-bold rounded-2xl shadow-lg transition hover:scale-[1.01] active:scale-[0.99] text-base cursor-pointer"
              >
                🎙️ {t("startPractice")}
              </button>
            </div>
          ) : (
            /* Active Practice Layout */
            <div className="max-w-3xl grid grid-cols-1 gap-6 animate-fadeIn">
              
              {/* Question Card / AI Avatar */}
              <div className="glass-panel rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden flex flex-col md:flex-row md:items-center gap-6">
                {/* Simulated AI Mentor Avatar */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-violet-600 via-blue-600 to-cyan-400 flex items-center justify-center text-white text-3xl shadow-inner relative flex-shrink-0 mx-auto md:mx-0">
                  🤖
                  <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-950 animate-pulse" />
                </div>

                <div className="space-y-2 text-center md:text-left flex-1">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <span className="text-[10px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest font-mono">
                      AI Mentor
                    </span>
                    <button
                      onClick={handleSpeakQuestion}
                      className="px-3 py-1 bg-white/50 dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-full text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Read aloud"
                    >
                      {t("readAloud")}
                    </button>
                  </div>
                  <h3 className="font-bold text-gray-500 dark:text-gray-400 text-xs">
                    {t("questionLabel", { number: currentQuestionIndex + 1 })}
                  </h3>
                  <p className="text-xl font-bold leading-relaxed text-gray-900 dark:text-white">
                    {questions[currentQuestionIndex]?.question}
                  </p>
                </div>
              </div>

              {/* Action / Recording controls */}
              <div className="glass-card rounded-3xl p-6 shadow-md flex flex-col items-center justify-center min-h-[220px] text-center space-y-4">
                {isRecording ? (
                  <div className="space-y-4">
                    {/* Pulsing visual mic controls */}
                    <div 
                      onClick={handleStopRecording}
                      className="w-18 h-18 rounded-full bg-red-500 hover:bg-red-650 text-white flex items-center justify-center text-xl shadow-lg mic-pulse cursor-pointer mx-auto"
                    >
                      🛑
                    </div>
                    <span className="text-sm font-extrabold text-red-500 block">
                      {t("recordingAnswer", { time: duration })}
                    </span>
                  </div>
                ) : transcribing ? (
                  <div className="space-y-4">
                    {/* Simulated bouncing waves */}
                    <div className="flex gap-1 items-end justify-center h-8">
                      <span className="wave-bar" />
                      <span className="wave-bar" />
                      <span className="wave-bar" />
                      <span className="wave-bar" />
                      <span className="wave-bar" />
                      <span className="wave-bar" />
                      <span className="wave-bar" />
                    </div>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                      {t("transcribing")}
                    </span>
                  </div>
                ) : !sessionFeedback ? (
                  <div className="space-y-3 w-full max-w-lg mx-auto">
                    {!isSpeechSupported ? (
                      <div className="space-y-3 w-full">
                        <span className="text-xs font-extrabold text-amber-500 block text-center">
                          ⚠️ Speech Recognition is not supported on this browser. Please type your answer.
                        </span>
                        <textarea
                          value={typedAnswer}
                          onChange={(e) => setTypedAnswer(e.target.value)}
                          className="w-full h-28 p-4 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-850 rounded-2xl text-sm leading-relaxed focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none dark:text-white font-medium"
                          placeholder="Type your answer in your own words..."
                        />
                        <button
                          onClick={handleSubmitTypedAnswer}
                          className="w-full py-3 bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 hover:from-violet-750 hover:to-cyan-600 text-white font-bold rounded-2xl shadow-md transition cursor-pointer text-xs"
                        >
                          Submit Answer
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={handleStartRecording}
                          className="px-8 py-3.5 bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 hover:from-violet-750 hover:to-cyan-600 text-white font-extrabold rounded-2xl shadow-lg hover:scale-[1.03] active:scale-[0.97] transition flex items-center gap-2 cursor-pointer mx-auto"
                        >
                          {t("speakAnswer")}
                        </button>
                        <span className="text-xs text-gray-450 block font-medium">{t("clickVoice")}</span>
                      </>
                    )}
                  </div>
                ) : (
                  /* Feedback Screen */
                  <div className="w-full text-left space-y-6 animate-fadeIn">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-150 dark:border-gray-800 pb-4 gap-3">
                      <h4 className="font-black text-xl bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-blue-400">
                        {t("feedbackTitle")}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">{t("performanceScore")}</span>
                        <span className="text-sm font-black px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
                          {sessionFeedback.score}% MATCH
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">{t("vocalTranscript")}</span>
                      <p className="p-4 bg-white/40 dark:bg-black/10 border border-gray-200 dark:border-gray-800 rounded-2xl text-sm italic font-medium text-gray-750 dark:text-gray-300">
                        &ldquo;{transcript}&rdquo;
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                      <div className="p-4 bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/20 rounded-2xl space-y-2">
                        <span className="text-emerald-500 font-black uppercase text-[10px] tracking-wider font-mono">✓ {t("strengthsTitle")}</span>
                        <ul className="list-disc list-inside space-y-1 text-emerald-955 dark:text-emerald-400">
                          {sessionFeedback.strengths.map(s => <li key={s}>{s}</li>)}
                        </ul>
                      </div>

                      <div className="p-4 bg-amber-500/5 dark:bg-amber-950/10 border border-amber-500/20 rounded-2xl space-y-2">
                        <span className="text-amber-500 font-black uppercase text-[10px] tracking-wider font-mono">⚠️ {t("weaknessesTitle")}</span>
                        <ul className="list-disc list-inside space-y-1 text-amber-955 dark:text-amber-400">
                          {sessionFeedback.weaknesses.map(w => <li key={w}>{w}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div className="p-4 bg-violet-50/50 dark:bg-violet-950/10 border border-violet-100/50 dark:border-violet-900/30 rounded-2xl space-y-2">
                      <h4 className="text-[10px] font-black text-violet-655 dark:text-violet-400 uppercase tracking-widest font-mono">
                        {t("detailedFeedbackTitle")}
                      </h4>
                      <p className="text-xs font-semibold leading-relaxed text-violet-900/90 dark:text-violet-300">
                        {sessionFeedback.detailedFeedback}
                      </p>
                    </div>

                    <div className="flex gap-4 justify-end pt-2">
                      <button
                        onClick={handleFinishPractice}
                        className="px-6 py-3 bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 text-white font-extrabold rounded-xl text-xs shadow-md transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                      >
                        {t("finishSession")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      );
    }
