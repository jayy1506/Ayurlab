import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => useContext(DataContext);

// Increment this whenever defaultInventoryItems or defaultRecipes change structurally.
// It forces old cached localStorage to be discarded so fresh defaults load.
const DATA_VERSION = '6.5';

const defaultExperiments = [
  {
    "id": 3,
    "title": "Agnitundi Vati",
    "description": "Agnimandya, Amajwara.",
    "shlok": "शुद्धसूतं विषं गन्धमजमोदा फलत्रयम्... लेहवत्साध्यते वन्हौ गुडो वा शर्करा तथा । गुग्गुलुर्वा क्षिपेत्तत्र चूर्ण तन्निर्मिता वटी ।।कुर्यादवन्हिसिद्धेन क्वचिद् गुग्गुलुना वटीम् । द्रवेण मधुना वाऽपि गुटिकां कारयेद् बुधः ।।\n                                               शा.स.म.ख. ७/२-३\n   \n             Reference \n                   शुद्धसूतं विषं गन्धमजमोदा फलत्रयम् ।\n                  स्वर्जिक्षारं यवक्षारं वन्हिसैन्धवजीरकम् ।।\n                  सौवर्चलं विडंगानि सामुद्रं टंकणं समम् ।\n                  विषमुष्टिः सर्वतुल्यं जम्बीराम्लेन मर्दयेत् । ।\n                  मरिचाभ्यां वटीं खादेदग्निमान्द्य प्रशान्तये ।।\n                                       (भै.र. अग्निमांद्यचिकित्सा 117-118)",
    "apparatus": [
      "Khalva yantra",
      "Cloth",
      "Steel vessel",
      "Tray"
    ],
    "rawIngredients": [
      {
        "name": "Suddha Parada",
        "qty": "1 part"
      },
      {
        "name": "Su. Vatsanabha",
        "qty": "1 part"
      },
      {
        "name": "Suddha Gandhaka",
        "qty": "1 part"
      },
      {
        "name": "Ajmoda",
        "qty": "1 part"
      },
      {
        "name": "Haritaki",
        "qty": "1 part"
      },
      {
        "name": "Bibhitaki",
        "qty": "1 part"
      },
      {
        "name": "Amalaki",
        "qty": "1 part"
      },
      {
        "name": "Svarji kshara",
        "qty": "1 part"
      },
      {
        "name": "Yavakshara",
        "qty": "1 part"
      },
      {
        "name": "Chitraka",
        "qty": "1 part"
      },
      {
        "name": "Saindhava lavana",
        "qty": "1 part"
      },
      {
        "name": "Shweta jiraka",
        "qty": "1 part"
      },
      {
        "name": "Sauvarchal lavana",
        "qty": "1 part"
      },
      {
        "name": "Vidanga",
        "qty": "1 part"
      },
      {
        "name": "Samudra lavana",
        "qty": "1 part"
      },
      {
        "name": "Su. Tankana",
        "qty": "1 part"
      },
      {
        "name": "Su. Vishamusti",
        "qty": "16 parts"
      },
      {
        "name": "Jambira swarasa",
        "qty": "Q.S."
      }
    ],
    "steps": [
      "Drugs 1 to 17 are finely powdered and sieved through cloth.",
      "Each drug powder is weighed as per mentioned and mixed together.",
      "The mixture is taken into khalva yantra and triturated with Jambira swarasa to a fine paste.",
      "Finally, tablets are prepared from the paste, dried in shade and stored."
    ],
    "precautions": [],
    "observations": {
      "rupa": "Smooth, Brownish black colour",
      "rasa": "Katu, Tikta",
      "matra": "125- 250 mg",
      "anupana": "Lime juice, warm water"
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786383637/agnitundi_vati_gpwakk.mp4"
  },
  {
    "id": 25,
    "title": "Arka Taila",
    "description": "Pama, Kandu, Vicharchika",
    "shlok": "अर्कपत्ररसे पक्वं हरिद्राकल्क संयुतम् । \n                        नाशयेत्सार्षपे तैलं पामां कच्छू विचर्चिकाम् ।।\n                                                           शा.स.म.ख. 9/148",
    "apparatus": [
      "Khalva yantra",
      "Angara kosthi",
      "Sneha patra",
      "Ladle",
      "Cloth"
    ],
    "rawIngredients": [
      {
        "name": "Arkapatra swarasa",
        "qty": "16 parts"
      },
      {
        "name": "Haridra",
        "qty": "1 Part"
      },
      {
        "name": "Sarshapa Taila",
        "qty": "4 part"
      }
    ],
    "steps": [
      "Collect the mature leaves of Arka, wash it with water and extract the swarasa.",
      "Take this swarasa to sneha patra and add Haridra kalka and Sarshapa taila to it and heat on moderate fire.",
      "Heating is continued till water contents are evaporated completely and only Sarshapa taila left or it shows mridupaka lakshanas.",
      "On cooling, filter the oil and preserved."
    ],
    "precautions": [
      "Avoid high heat to prevent burning of the paste."
    ],
    "observations": {
      "rupa": "Greenish Yellow",
      "rasa": "Katu, Tikta",
      "gandha": "Haridra-Sarshapa gandha",
      "modeOfApplication": "External application on skin",
      "uses": "Pama, Kandu, Vicharchika"
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786386824/Preparation_of_Arka_Taila_%E0%A4%85%E0%A4%B0%E0%A5%8D%E0%A4%95_%E0%A4%A4%E0%A5%88%E0%A4%B2__720p_caption_hjwtt2.mp4"
  },
  {
    "id": 32,
    "title": "Ananda Bhairava Rasa",
    "description": "Jwaratisara, Amavata, Kasa, Swasa",
    "shlok": "हिङ्गुलञ्च विषं व्योषं मरिचं टंकण कणा ।\n             जातिकोषसमं चूर्ण जम्बीरद्रव मर्दितम् ।।\n\n             रक्तिमानां वटी कुर्यात् खादेदार्द्रकसंयुताम ।\n\n                                                  र. सा. सं ज्वराधिकार 2/103-105",
    "apparatus": [
      "Khalva yantra",
      "Ladle",
      "Drying tray"
    ],
    "rawIngredients": [
      {
        "name": "Su. Hingula",
        "qty": "1 Part"
      },
      {
        "name": "Su. Vatsanabha",
        "qty": "1 Part"
      },
      {
        "name": "Sunthi churna",
        "qty": "1 Part"
      },
      {
        "name": "Marich churna",
        "qty": "2 Parts"
      },
      {
        "name": "Pippali churna",
        "qty": "2 Parts"
      },
      {
        "name": "Su. Tankana",
        "qty": "1 Part"
      },
      {
        "name": "Jatikosha (Javitri)",
        "qty": "1 Part"
      },
      {
        "name": "Jambira swarasa",
        "qty": "Q.S. for Bhavana"
      }
    ],
    "steps": [
      "Mix fine powders of 1 to 7 ingredients to form a homogeneous mixture.",
      "To this add Jambira swarasa and triturate for one day.",
      "Make the tablets of 250 mg and dry them in shadow."
    ],
    "precautions": [
      "Ensure all mineral ingredients are fully purified before use."
    ],
    "observations": {
      "varna": "Reddish brown",
      "matra": "250 mg",
      "anupana": "Ardraka swarasa, Madhu",
      "uses": "Jwaratisara, Amavata, Kasa, Swasa"
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786386798/Preparation_of_Ananda_Bhairava_Rasa_1080p_caption_-_Copy_rpp9fw.mp4"
  },
  {
    "id": 39,
    "title": "Arka Lavana",
    "description": "Gulma, Udara Roga, Plihodara, Yakritodara",
    "shlok": "अर्कपत्रं सलवणमन्तर्धूमं दहेन्नरः ।\nमस्तुना तत्पिबेत्क्षारं प्लीहगुल्मोदरापहम् ॥ १५ ॥\n              Reference: Bhaishajya Ratnavali, Pliha–Yakrit Roga Adhikara, Verse 15.",
    "apparatus": [
      "Khalva Yantra",
      "Two Saravas (earthen dishes)",
      "Multani Mitti (clay)",
      "Cloth strips",
      "Cow-dung cakes (for Puta)",
      "Ladle",
      "Airtight glass container"
    ],
    "rawIngredients": [
      {
        "name": "Arka Patra (Calotropis gigantea leaves)",
        "qty": "15 leaves"
      },
      {
        "name": "Saindhava Lavana",
        "qty": "Q.S."
      }
    ],
    "steps": [
      "Collect mature Arka leaves, wash thoroughly, and dry them.",
      "Arrange a layer of Arka leaves in a Sarava.",
      "Spread finely powdered Saindhava Lavana uniformly over the leaves.",
      "Repeat alternate layers of Arka leaves and Saindhava Lavana, ensuring the bottommost and topmost layers are Arka leaves.",
      "Cover with another Sarava to prepare a Sarava Samputa.",
      "Seal the joint using cloth smeared with Multani Mitti (clay) in successive layers and dry it completely.",
      "Heat the Samputa using cow-dung cakes (Puta) until it becomes red hot, then allow it to cool naturally.",
      "Open the Samputa carefully, collect the contents, powder them finely in a Khalva Yantra, and store in an airtight container."
    ],
    "precautions": [
      "The first and last layers must always be Arka leaves.",
      "Saindhava Lavana should be finely powdered.",
      "Seal the Sarava properly to avoid leakage during heating.",
      "Allow complete cooling before opening the Samputa.",
      "Store the finished product in an airtight container to prevent moisture absorption."
    ],
    "observations": {
      "rupa": "Black, similar to Kajjali",
      "rasa": "Lavana",
      "gandha": "Nirgandha (odourless)",
      "matra": "500 mg",
      "uses": "Gulma, Udara Roga, Plihodara, Yakritodara"
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786297555/arka_lavana_nwoabf.mp4"
  },
  {
    "id": 26,
    "title": "Vasavaleha",
    "description": "Raksha pitta, Kasa, Swasa, Rajayakshma, Jwara, Parshwasula, Hriddhshula.",
    "shlok": "वासकस्य रसप्रस्थं मानिका सितशर्करा ।\n  पिप्पल्या व्दिपलं तावत्सर्पिषश्च शनैः पचेत् ।।\n\n तस्मिल्लेहत्वमायाते शीते क्षौद्रपलाष्टकम् । \n दत्वाऽवतारयेद्वैद्वो लीढो लेहोऽयमुत्तमः ।।\n  हन्तेव राजयक्ष्माणं कासं श्वासं च दारुणम् ।\n\n पार्श्वशुलं च हृच्छूलं हृच्छूलं रक्तपित्तं ज्वरं तथा । । ।।\n\n                                               भै.र.राजयक्ष्माधिकार 14/37-39",
    "apparatus": [
      "Khalva yantra",
      "Angara kosthi",
      "Steel vessel",
      "Stirrer",
      "Cotton cloth"
    ],
    "rawIngredients": [
      {
        "name": "Vasa swarasa",
        "qty": "768 ml."
      },
      {
        "name": "Sita (Sugar candy)",
        "qty": "384 g"
      },
      {
        "name": "Pippali",
        "qty": "96 g"
      },
      {
        "name": "Ghrita (Goghrita)",
        "qty": "96 g"
      },
      {
        "name": "Madhu",
        "qty": "384 g"
      }
    ],
    "steps": [
      "Vasa swarasa is extracted from freshly collected vasa leaves.",
      "It is taken into a vessel and powdered sita is added to it and heated over mandagni.",
      "When it reaches proper paka (Tantupaka), vessel is taken out from the fire and pippali churna and ghrita are added and thoroughly mixed.",
      "When the avaleha becomes cool, honey is added and mixed uniformly.",
      "Then it is stored in a air tight container."
    ],
    "precautions": [
      "If fresh Vasa swarasa is not available, vasa kwatha prepared from vasa panchanga should be used."
    ],
    "observations": {
      "rupa": "Greenish brown, smooth, semisolid",
      "rasa": "Kashaya, Tikta, Madhura",
      "matra": "6-12gm",
      "anupana": "Milk, Water"
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786438464/vaasavaleha_syffc2.mp4"
  },
  {
    "id": 13,
    "title": "Gandhaka Malahara",
    "description": "Pama, Dadru, Kandu, Vrana.",
    "shlok": "सिक्थतैलं सुविमलं रसतालकसंमिःम् ।\nगन्धक गिरिसिंदूरं तोलकाद्ध मितं पृथक् ।। 63 ।।\nटङ्कणं घनसार'च पृथक माषद्वयोन्मितम् ।\nदत्वा सम्मेल्य यत्नेन काचकुष्यां निध। पयेत् ॥ 64 ॥ \nमतो मलहरोऽयं तु गन्धकाद्यसमाद्धयः । \nविनाशयत्याशु भृशं पामामत्यथेदारुणाम् ॥ 66 ॥ \nस्नतीलकसंमितमिति पटतीलकाः सिक्थतैलस्य। घनसारं कर्पूरम् ॥ 67 ॥\n                                                                     Rasatarangini 8/63-67",
    "apparatus": [
      "Khalva yantra",
      "Steel vessel",
      "Stirrer",
      "Cloth",
      "Wide mouth glass bottle"
    ],
    "rawIngredients": [
      {
        "name": "Siktha Taila",
        "qty": "72 g"
      },
      {
        "name": "Suddha Gandhaka",
        "qty": "6 g"
      },
      {
        "name": "Girisindura",
        "qty": "6 g"
      },
      {
        "name": "Tankana",
        "qty": "2 g"
      },
      {
        "name": "Karpura (Camphor)",
        "qty": "2 g"
      }
    ],
    "steps": [
      "Drugs 2-5 are taken in Khalvayantra and finely powdered.",
      "To this powder, add Skitha taila and triturate for half an hour till a uniform mixture is obtained.",
      "Preserve the mixture (Malahara) in a wide mouthed glass jar."
    ],
    "precautions": [
      "Drugs should be finely powdered.",
      "Malahara kalpas should be preserved in wide mouthed glass container for easy operation."
    ],
    "observations": {
      "rupa": "Brown, smooth",
      "gandha": "Karpura gandha",
      "matra": "Q.S. for external application only",
      "uses": "Pama, Dadru, Kandu, Vrana",
      "note": "If only Gandhaka and Siktha taila are used to prepare Malahara form by following above mentioned method of preparation, then it is called Gandhaka Malahara."
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786438540/Gandhaka_Malahara_Preparation_720p_caption_dvvj61.mp4"
  },
  {
    "id": 21,
    "title": "Taila Murchana",
    "description": "Removes bad odour and gives reddish colour and fragrance to Tila taila.",
    "shlok": "तैलं कृत्वा कटाहे दृढतर विमले मन्दमन्दानलैस्तत् तैलं । \nनिष्फेनभावं गतमिह च यदा शैत्यभाव समेत्य ।।\nमञ्जिष्ठारात्रिलोधैर्जलधरनलिकैः सामलैः साक्षपथ्यै । \nसूचीपुष्पाघ्रनीरैरुपहितकथितैगन्धयोगं जहाति ।।\nतैलस्येन्दुकलांशिकैकविकसा भागोऽपि मुर्च्छाविधौ ।\nये चान्ये त्रिफलापयोदरजनीहीबेर लोध्रान्विताः ।। \nसूचीपुष्प वटप्ररोह नलिकास्तस्याश्च पादांशिका ।\nदुर्गन्धं विनिहन्ति विनिहन्ति तैलमरूणं सौरभ्यमाकुर्वते ।।\n                                                  भै. र. ज्वर चि. 5/1286-1289",
    "apparatus": [
      "Khalva yantra",
      "Angara kosthi",
      "Taila-patra",
      "Ladle",
      "Cloth"
    ],
    "rawIngredients": [
      {
        "name": "Manjistha",
        "qty": "1/16 Part"
      },
      {
        "name": "Haridra",
        "qty": "1/64 Part"
      },
      {
        "name": "Lodhra",
        "qty": "1/64 Part"
      },
      {
        "name": "Musta (Nagarmotha)",
        "qty": "1/64 Part"
      },
      {
        "name": "Hribera",
        "qty": "1/64 Part"
      },
      {
        "name": "Haritaki",
        "qty": "1/64 Part"
      },
      {
        "name": "Vibhitaki",
        "qty": "1/64 Part"
      },
      {
        "name": "Amalaki",
        "qty": "1/64 Part"
      },
      {
        "name": "Shuchipushpa",
        "qty": "1/64 Part"
      },
      {
        "name": "Vatapraroha (Vatankura)",
        "qty": "1/64 Part"
      },
      {
        "name": "Nalika",
        "qty": "1/64 Part"
      },
      {
        "name": "Tila-Taila",
        "qty": "1 part"
      },
      {
        "name": "Water",
        "qty": "4 parts"
      }
    ],
    "steps": [
      "Required quantity of Tila-taila is taken in a Taila patra and heated on mandani till the foam is subsided.",
      "Drugs from 1-8 are finely powdered, Suchipushpa, Vatankura, nalika are made into kalka form. Then all the drugs ar mixed together and kalka is made by adding little quantity of water.",
      "Add this kalka to the taila.",
      "Also add 4 times of water to the Taila.",
      "Boil the whole contents on mandagni till the water is evaporated completely.",
      "On cooling filter the Taila and store it for further use."
    ],
    "precautions": [
      "Precautions are the same as mentioned in Ghrita murchchhana."
    ],
    "observations": {
      "observation": "By this process unpleasant odour of the oil is removed. It obtains reddish colour and fragrance.",
      "use": "Murchchhita Tila-taila is used for the preparation of different Taila kalpanas."
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786380740/tailamurchana_tw1feb.mp4"
  },
  {
    "id": 9,
    "title": "Chandrodaya Varti",
    "description": "Timira, Kacha, Arbuda, Naktandhya, etc, eye diseases.",
    "shlok": "हरीतकी वचा कुष्ठं पिप्पली मरिचानि च । \n                     विभीतकस्य मज्जा च शंखनाभिर्मनःशिला ।।१०५।। \n                    सर्वमेतत्समाहृत्य छागक्षीरेण पेषयेत् ।\n                                  (भैषज्यरत्नावली, नेत्ररोगाधिकार, १०५-१०५ १/२)",
    "apparatus": [
      "Khalva yantra",
      "Cloth",
      "Tray"
    ],
    "rawIngredients": [
      {
        "name": "Shankhanabhi",
        "qty": "1 Part"
      },
      {
        "name": "Bibhitaki",
        "qty": "1 Part each"
      },
      {
        "name": "Su. Manashila",
        "qty": "1 Part"
      },
      {
        "name": "Pippali, Maricha, Kushta, Vacha",
        "qty": "1 Part each"
      },
      {
        "name": "Aja-dugdha",
        "qty": "Q.S."
      }
    ],
    "steps": [
      "Drugs 1 to 8 are finely powdered and seiver through cloth and weight in equal quantitity.",
      "All the powders are taken into khalvayantra and triturated with goat’s milk till it becomes a fine paste.",
      "Vartis are prepared of Yava size and drived in shade and preserved."
    ],
    "precautions": [],
    "observations": {
      "rupa": "Smooth, Brown",
      "application": "Rub with honey on pumice stone of pea size. Apply to inner surface of eyelids like collyrium."
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786297249/chandrodaya_vati_ymedlv.mp4"
  },
  {
    "id": 20,
    "title": "Ghrita Murchana",
    "description": "Removes Amadosa, bad odour, and enhances potency of Ghrita.",
    "shlok": "पथ्याधात्रीविभीतैर्जलधरजनी मातुलुङ्गद्रवैश्च । \nसर्वैरेतैः सुपिष्टैः पलकपरिमितैर्मन्दमन्दानलेन । \nआज्यं प्रस्थं विफेनं परिचपलगतं मुर्च्छयेद्वैद्यराजस्तस्मा- \nदामोपदोषं हरति च सहसा वीर्यवान सौख्यदायि ।।\n                                          भै. र. ज्वर चि. 5/1285",
    "apparatus": [
      "Khalva yantra",
      "Angara kosthi",
      "Steel vessel",
      "Ladle",
      "Strainer"
    ],
    "rawIngredients": [
      {
        "name": "Haritaki",
        "qty": "40 g"
      },
      {
        "name": "Vibhitaki",
        "qty": "40 g"
      },
      {
        "name": "Amalaki",
        "qty": "40 g"
      },
      {
        "name": "Musta (Nagarmotha)",
        "qty": "40 g"
      },
      {
        "name": "Haridra",
        "qty": "40 g"
      },
      {
        "name": "Matulunga swarasa",
        "qty": "Q.S."
      },
      {
        "name": "Ghrita (Goghrita)",
        "qty": "768 g"
      },
      {
        "name": "Water",
        "qty": "3.072 L"
      }
    ],
    "steps": [
      "Prescribed quantity of ghrita is taken in a vessel and heated on mandagni till the froth is disappeared.",
      "Then the drug from 1-5 are made into fine paste (Kalka) by adding Matulunga swarasa.",
      "Kalka & water are added to ghrita and again heated on mandagni.",
      "Heating is continued till the water is evaporated completely and only ghrita is left.",
      "Then the ghrita is filtered and stored for further use."
    ],
    "precautions": [
      "Though it is not mentioned in the text to add water, but in practice four times of water to that of ghrita should be added along with kalka.",
      "While adding the kalka it should be fine & added little by little and mixed well.",
      "Sneha murchchhana should be done on mandagni."
    ],
    "observations": {
      "observation": "By this process, unpleasant odour of the ghrita is removed. It obtains good colour and fragrance.",
      "use": "Murchchhita ghrita is used for the preparation of different ghrita Kalpanas.",
      "note": "There is no reference to Murchchhana either in Laghu trayees or in Brihatrayees. Acharya Govind das the author of Bhaishajya Ratnavali is the first person to mention about Sneha Murchchhana. It is a process adopted for Ghrita/Taila to enhance their potency (Viryavan Saukhyadayi), to remove their bad odour (Gandham Vinahanti) and Amadosa (Amadosam harati)."
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786438350/Preparation_of_Ghrita_Murchchhana_%E0%A4%98%E0%A5%83%E0%A4%A4_%E0%A4%AE%E0%A5%82%E0%A4%B0%E0%A5%8D%E0%A4%9A%E0%A5%8D%E0%A4%9B%E0%A4%A8%E0%A4%BE__720p_caption_m0t3tn.mp4"
  },
  {
    "id": 4,
    "title": "Chitrakadi Vati",
    "description": "Agnimandya, Amadosha, Grahani.",
    "shlok": "चित्रकंपिप्पलीमूलं व्दौ क्षारो  लवणानि च ।\n                   व्योषं हिंग्वजमोदां च चव्यं चैकत्र चूर्णयेत् । \n                    गुटिका मातुलंङ्गस्य दाडिमस्य रसेन वा\n                    कृता विपाचयत्यामं दीपयात्याशु  चानलम् ।।\n                                                                   च.चि. 15/96",
    "apparatus": [
      "Khalva yantra",
      "Cloth",
      "Steel vessel",
      "Tray"
    ],
    "rawIngredients": [
      {
        "name": "Chitraka",
        "qty": "1 part"
      },
      {
        "name": "Pippali mula",
        "qty": "1 part"
      },
      {
        "name": "Yavakshara",
        "qty": "1 part"
      },
      {
        "name": "Sarji kshara",
        "qty": "1 part"
      },
      {
        "name": "Saindhava lavana",
        "qty": "1 part"
      },
      {
        "name": "Sauvarchal lavana",
        "qty": "1 part"
      },
      {
        "name": "Vid lavana",
        "qty": "1 part"
      },
      {
        "name": "Audbhida lavana",
        "qty": "1 part"
      },
      {
        "name": "Samudra lavana",
        "qty": "1 part"
      },
      {
        "name": "Sunthi (Dry Ginger)",
        "qty": "1 part"
      },
      {
        "name": "Maricha (Black Pepper)",
        "qty": "1 part"
      },
      {
        "name": "Pippali",
        "qty": "1 part"
      },
      {
        "name": "Su. Hingu (Asafoetida)",
        "qty": "1 part"
      },
      {
        "name": "Ajmoda",
        "qty": "1 part"
      },
      {
        "name": "Chavya",
        "qty": "1 part"
      },
      {
        "name": "Matulunga swarasa",
        "qty": "Q.S."
      }
    ],
    "steps": [
      "Drugs 1 to 15 are finely powdered and sieved through cloth.",
      "Each drug powder is weighed as per mentioned and mixed together in a vessel",
      "Then the mixture is taken into khalva yantra and triturated with matulunga swarasa or dadima swarasa to a fine paste.",
      "When it attains a proper consistency, tablets are prepared from the paste, dried in shade and stored in an air tight container."
    ],
    "precautions": [
      "Lavanga should be fried in pan before being made into churna form.",
      "Tablets should be dried in shade."
    ],
    "observations": {
      "rupa": "Brownish black, Smooth",
      "rasa": "Katu, Tikta",
      "matra": "500 mg",
      "anupana": "Warm water, Butter milk"
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786438783/chitrakari_vati_hpb1mf.mp4"
  },
  {
    "id": 14,
    "title": "Dashanga Lepa",
    "description": "Visarpa, Visha, Visphota, Sotha, Dusta vrana.",
    "shlok": "शिरीषयष्टीनतचन्दनैलामांसीहरिद्राद्वयकुष्ठवालैः ।\n                    लेपो दशाङ्गः सघृतः प्रयोज्यो विसर्पकुष्ठज्वरशोथहारी ।।16।।\n                                                           (भैषज्यरत्नावली, विसर्पाधिकार; 16)\n                    शिरीषं मधुयष्टीच तगरं रक्तचंदनम् ।\n                    एला मांसी निशायुग्मं कुष्ठं वालकमेव च ।।\n                    इति सञ्चूर्ण लेपोऽयं पञ्चमांशघृतप्लुतः ।\n                    जलेन क्रियते सुज्ञैर्दशाङ्ग इति संज्ञितः ।। \n                    विसर्पान्विष विस्फोटान्शोधान्दुष्टव्रणाञ्जयेत् ।\n                                                                शा.स.उ.ख. ११/५-६",
    "apparatus": [
      "Khalva yantra",
      "Ladle"
    ],
    "rawIngredients": [
      {
        "name": "Sirisha twaka",
        "qty": "1 part"
      },
      {
        "name": "Madhuyasti",
        "qty": "1 part"
      },
      {
        "name": "Tagar",
        "qty": "1 part"
      },
      {
        "name": "Raktachandana",
        "qty": "1 part"
      },
      {
        "name": "Ela",
        "qty": "1 part"
      },
      {
        "name": "Jatamamsi",
        "qty": "1 part"
      },
      {
        "name": "Haridra",
        "qty": "1 part"
      },
      {
        "name": "Daruharidra",
        "qty": "1 part"
      },
      {
        "name": "Kustha",
        "qty": "1 part"
      },
      {
        "name": "Valaka",
        "qty": "1 part"
      },
      {
        "name": "Ghrita (Goghrita)",
        "qty": "1/5th part"
      },
      {
        "name": "Water",
        "qty": "Q.S."
      }
    ],
    "steps": [
      "Drugs from 1-10 are finely powdered.",
      "To this, few drops of Ghrita is added and mixed thoroughly.",
      "When required, mix with little quantity of water, make a paste and apply on affected part of the skin."
    ],
    "precautions": [
      "Before application, ensure the paste has smooth consistency without any coarse particles."
    ],
    "observations": {
      "rupa": "Yellowish, smooth",
      "gandha": "Ela gandha",
      "matra": "Visarpa, Visha, Visphota, Sotha, Dusta vrana"
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786438965/Dashanga_Lepa_Preparation_720p_caption_1_mbnwu1.mp4"
  },
  {
    "id": 16,
    "title": "Shadanga Paneeya",
    "description": "Jwara, Trishna, Daha",
    "shlok": "क्षुण्णं द्रव्यपलं साध्यं चतुःषष्टिपले जले । \n          अर्धशिष्टं च तद्देयं पाने भक्तादिसंविधौ ।।\n                          शा.स.म.ख. 2/157\nमुस्ता पर्पटकोशीर चंदनोदीच्य नागरैः ।\nशृतशीतं जलंदेयं पिपासा ज्वरशान्तये ।।\n                                                भै.र. ज्वराधिकार 25",
    "apparatus": [
      "Khalva yantra",
      "Steel vessel",
      "Clean cloth",
      "Ladle",
      "Gas stove"
    ],
    "rawIngredients": [
      {
        "name": "Musta (Nagarmotha)",
        "qty": "3 gm"
      },
      {
        "name": "Parpataka",
        "qty": "3 gm"
      },
      {
        "name": "Usheer",
        "qty": "3 gm"
      },
      {
        "name": "Chandana",
        "qty": "3 gm"
      },
      {
        "name": "Rhibera",
        "qty": "3 gm"
      },
      {
        "name": "Nagara",
        "qty": "3 gm"
      },
      {
        "name": "Water",
        "qty": "1152 ml (64 parts)"
      }
    ],
    "steps": [
      "Take the drugs 1 to 6 in equal quantities and make course powder in khalva yantra and mix.",
      "Take the mixture in a steel vessel and add water.",
      "Place the vessel on mandagni and boil the mixture till it is reduced to half.",
      "Then filtrate the contents. The collected liquid is known as Shadanga paneeya."
    ],
    "precautions": [
      "Before boiling, drugs must be coarsely powdered.",
      "Boiling should be done on mandagni."
    ],
    "observations": {
      "rupa": "Brown",
      "rasa": "Tikta, Madhura",
      "gandha": "Usheer",
      "matra": "10-20 ml, Muhur-muhu",
      "use": "Jwara, Trishna, Daha"
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786438955/Preparation_of_Shadanga_Paneeya_720p_caption_t8hx9s.mp4"
  },
  {
    "id": 15,
    "title": "Mustadi Pramathya",
    "description": "Raktatisara",
    "shlok": "प्रमथ्या प्रोच्यते द्रव्यपलात्कल्कीकृताच्छृतात् ।\nतोयेऽष्टगुणिते तस्या: पानमाहुः पलव्दयम् ।।\n                                   शा.स.म.ख. २ -१५०\nमुस्तेकेन्द्रयवैः सिद्धा प्रमथ्या व्दिपलोन्मिता ।\n सुशिता मधुसंयुक्ता रक्तातिसार नाशिनी ।।\n                               शा.स.म.ख. २- १५१",
    "apparatus": [
      "Khalva yantra",
      "Steel vessel",
      "Ladle",
      "Gas stove",
      "Clean cloth"
    ],
    "rawIngredients": [
      {
        "name": "Musta (Nagarmotha)",
        "qty": "1 Part"
      },
      {
        "name": "Indrayava",
        "qty": "1 Part"
      },
      {
        "name": "Water",
        "qty": "16 Parts"
      }
    ],
    "steps": [
      "Take Musta & Indrayava in khalva yantra and make it into fine paste (kalka) by adding a little water.",
      "Take this kalka into a vessel and add water to it.",
      "Place the vessel on Mangagni and boil the contents till it reduce to half.",
      "On cooling filter it with cloth & use it."
    ],
    "precautions": [
      "In Pramathya, instead of course powder, kalka is to be used.",
      "Water should be clean & potable."
    ],
    "observations": {
      "consistency": "A thick decoction may be obtained",
      "rupa": "Brownish",
      "rasa": "Kashaya, Tikta",
      "gandha": "Musta",
      "matra": "2 Pala (96 ml) in divided doses",
      "anupana": "Madhu",
      "use": "Raktatisara"
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786386194/Mustadi_Pramathya_Preparation_Guide_720p_caption_evcy2f.mp4"
  },
  {
    "id": 22,
    "title": "Triphala Ghrita",
    "description": "Timira, Netraruja, Netrasrava, Netra roga",
    "shlok": "त्रिफला त्र्यूषणं द्राक्षा मधुकं कटुरोहिणी । \n            प्रपौण्डरीकं सूक्ष्मैला विडङ्गं नागकेशरम् ।।181।। \n           नीलोत्पलं शारिवे द्वे चन्दनं रजनीद्वयम् । \n           कार्षिकैः पयसा तुल्यं त्रिगुणं त्रिफलारसम् ।।182।।\n           घृतप्रस्थं पचेदेतत् सर्वनेत्ररुजापहम् ।\n                                  भै.र. नेत्ररोगाधिकार 181-182",
    "apparatus": [
      "Khalva yantra",
      "Angara kosthi",
      "Steel vessel (Sneha-patra)",
      "Ladle",
      "Cloth"
    ],
    "rawIngredients": [
      {
        "name": "Haritaki",
        "qty": "12 g"
      },
      {
        "name": "Bibhitaki",
        "qty": "12 g"
      },
      {
        "name": "Amalaki",
        "qty": "12 g"
      },
      {
        "name": "Sunthi (Dry Ginger)",
        "qty": "12 g"
      },
      {
        "name": "Maricha (Black Pepper)",
        "qty": "12 g"
      },
      {
        "name": "Pippali",
        "qty": "12 g"
      },
      {
        "name": "Draksha",
        "qty": "12 g"
      },
      {
        "name": "Yastimadhu",
        "qty": "12 g"
      },
      {
        "name": "Katurohini",
        "qty": "12 g"
      },
      {
        "name": "Prapaundarika",
        "qty": "12 g"
      },
      {
        "name": "Suksmaila",
        "qty": "12 g"
      },
      {
        "name": "Vidanga",
        "qty": "12 g"
      },
      {
        "name": "Nagakeshara",
        "qty": "12 g"
      },
      {
        "name": "Nilotpala (Utpala)",
        "qty": "12 g"
      },
      {
        "name": "Sweta sarava",
        "qty": "12 g"
      },
      {
        "name": "Krishna sariva",
        "qty": "12 g"
      },
      {
        "name": "Sweta chandana",
        "qty": "12 g"
      },
      {
        "name": "Haridra",
        "qty": "12 g"
      },
      {
        "name": "Daruharidra",
        "qty": "12 g"
      },
      {
        "name": "Ghrita (Goghrita)",
        "qty": "768 g"
      },
      {
        "name": "Godugdha (Cow's milk)",
        "qty": "768 g"
      },
      {
        "name": "Triphala-rasa (Kwatha)",
        "qty": "2.304 Lits"
      }
    ],
    "steps": [
      "Drugs 1-19 are made into kalka form.",
      "Take prescribed quantity of Go-ghrita in a Snehapatra and add kalka, Go-dugha and Triphala kwatha to it and mix well.",
      "Put the Snehapatra on angar koshti and give moderate heat.",
      "Heating is continued till the water contents are evaporated completely and sneha siddha lakshanas are appeared.",
      "At this stage, Sneha (Ghrita) is filtered and preserved."
    ],
    "precautions": [
      "Boil on low heat to prevent burning of ingredients."
    ],
    "observations": {
      "rupa": "Greenish yellow, Smooth, Snigdha",
      "gandha": "Mishra gandha",
      "matra": "1/2 -1 Tola, 4 drops for Nasya",
      "anupana": "Warm milk, Warm water",
      "uses": "Timira, Netraruja, Netrasrava, Netra roga"
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786438617/Triphala_Ghrita__Ancient_Preparation_1080p_caption_zkadfb.mp4"
  },
  {
    "id": 29,
    "title": "Guduchi Ghana",
    "description": "Jirnajwara, Amlapitta, Raktapitta",
    "shlok": "क्वाथादिनां पुनःपाकात् घनत्वं सा रसक्रियाः ।\n                                                                  शा.स.म.ख.८-१\nReference-   Ayurved Prakash 3",
    "apparatus": [
      "Iron khalva yantra",
      "Knife",
      "Steel vessel",
      "Clean cloth",
      "Ladle",
      "Tray"
    ],
    "rawIngredients": [
      {
        "name": "Guduchi",
        "qty": "50 g"
      },
      {
        "name": "Water",
        "qty": "800 ml"
      }
    ],
    "steps": [
      "Thumb sized stems of Guduchi are collected, cut into small pieces and crushed to the pulp.",
      "The pulp is taken in to the vessel and to these 16 parts of water is added and heated on mandagni to reduce the water to 1/4th",
      "It is filtered in another vessel and again heated on mandagni till it attains a semisolid consistency",
      "Then it is taken in tray and dried in sun till the moisture evaporates completely and stored in air tight container."
    ],
    "precautions": [
      "Swarasa or kwatha should be kept ready as Rasakriya is prepared by reheating the Kwatha or Swarasa.",
      "Reheating process should be done on mandagni",
      "While reheating continuous stirring is required.",
      "When Kwatha or Swarasa attains semisolid consistency (Rasakriya) then it should be dried in Sun."
    ],
    "observations": {
      "rupa": "Brownish",
      "rasa": "Tikta",
      "gandha": "Guduchi",
      "matra": "Generally it is advised to take in a dose of 1 to 2 gm.",
      "use": "Jirnajwara, Amlapitta, Raktapitta",
      "note": "Shri Yadavaji Trikamji Acharya has mentioned rasakriya of Guduchi for Jwara as 'Samshamani Vati'"
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786438603/Guduchi_Ghana_Preparation_1080p_caption_-_Copy_ezz3u1.mp4"
  },
  {
    "id": 30,
    "title": "Haridra Khanda",
    "description": "Sitapitta, Kandu, Visphota, Dadru, Udara, Kotha",
    "shlok": "हरिद्रायाः पलान्यष्टौ षटपलं हविषस्तथा ।\n  क्षीराढकेन संयुक्तं खण्डस्यार्द्धशतं तथा ।।\n  पचेन्मृव्दग्निना वैद्यो भाजने मृण्मये दृढे । \n  त्रिकटुश्च त्रिजातं च कृमिघ्नं त्रिवृता तथा ।।\n  त्रिफला केशरं मुस्तं लौहं प्रति पलं पलम् । \n  सचर्ण्य प्रक्षिपेत्तत्र तोलकार्द्धन्तु भक्षयेत् । ।\n  कण्डुविस्फोटदगुणां देहो भवति नान्यथा ।\n\n                                भै.र.शीतपीत्तरोगाधिकार १२-१४",
    "apparatus": [
      "Khalva yantra",
      "Angara kosthi",
      "Cloth",
      "Steel vessel",
      "Ladle",
      "Knife"
    ],
    "rawIngredients": [
      {
        "name": "Haridra",
        "qty": "384 g"
      },
      {
        "name": "Ghrita (Goghrita)",
        "qty": "288g"
      },
      {
        "name": "Godugdha (Cow's milk)",
        "qty": "3 lit."
      },
      {
        "name": "Sita (Sugar candy)",
        "qty": "2.4 kg"
      },
      {
        "name": "Trikatu",
        "qty": "48 g each"
      },
      {
        "name": "Trijata",
        "qty": "48 g each"
      },
      {
        "name": "Vidanga",
        "qty": "48 g"
      },
      {
        "name": "Trivritta",
        "qty": "48 g"
      },
      {
        "name": "Triphala",
        "qty": "48 g each"
      },
      {
        "name": "Nagkeshara",
        "qty": "48 g"
      },
      {
        "name": "Musta (Nagarmotha)",
        "qty": "48 g"
      },
      {
        "name": "Lohabhasma",
        "qty": "48 g"
      }
    ],
    "steps": [
      "Wet Haridra (rhizome) is collected, cleaned well, external coverings are separated with knife and made into fine kalka form.",
      "The kalka is fried with Goghrita on mandagni till ghrita is separated from kalka.",
      "In another vessel sugar is taken and required quantity of godugdha is added and boiled on mandagni to lehapaka",
      "When the Paka is ready, haridra kalka is added to it and mixed thoroughly.",
      "Then vessel is taken out of fire and fine powders of drugs 5 to 12 are added to it and mixed together to form a homogeneous mixture.",
      "On cooling it is preserved in a wide mouthed vessel."
    ],
    "precautions": [
      "Clean wet Haridra thoroughly before making kalka.",
      "Constant stirring is necessary during preparation of lehapaka to prevent sticking."
    ],
    "observations": {
      "rupa": "Pitavarna, Smooth, lehyaform",
      "rasa": "Madhura, Kashaya",
      "gandha": "Haridra",
      "matra": "6 gm",
      "anupana": "Water, milk",
      "use": "Sitapitta, Kandu, Visphota, Dadru, Udara, Kotha"
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786438641/Haridra_Khanda_Preparation_1080p_caption_1_xshr84.mp4"
  },
  {
    "id": 2,
    "title": "Hingwastaka Churna",
    "description": "Agnimandya, Shula, Gulma, Vataroga.",
    "shlok": "",
    "apparatus": [
      "Khalva yantra",
      "Cloth",
      "Tray",
      "Spoon"
    ],
    "rawIngredients": [
      {
        "name": "Sunthi (Dry Ginger)",
        "qty": "3 gm"
      },
      {
        "name": "Maricha (Black Pepper)",
        "qty": "3 gm"
      },
      {
        "name": "Pippali",
        "qty": "3 gm"
      },
      {
        "name": "Ajmoda",
        "qty": "3 gm"
      },
      {
        "name": "Saindhava lavana",
        "qty": "3 gm"
      },
      {
        "name": "Shweta jiraka",
        "qty": "3 gm"
      },
      {
        "name": "Krishna jiraka",
        "qty": "3 gm"
      },
      {
        "name": "Su. Hingu (Asafoetida)",
        "qty": "3 gm"
      }
    ],
    "steps": [
      "Drugs 1 to 7 are cleaned and finely powdered.",
      "Hingu is fried in go-ghrita and is finely powdered.",
      "Then all the powders are mixed together to form a homogeneous mixture.",
      "It is stored in a air tight container."
    ],
    "precautions": [],
    "observations": {
      "appearance": "Blackish brown, Sukshma",
      "rasa": "Katu, Tikta, Lavana",
      "gandha": "Hingu",
      "matra": "1-2 gm",
      "anupana": "Warm water, Takra, Ghee"
    },
    "videoUrl": "/videos/Hingwastaka Churna Preparation Guide_720p_caption.mp4"
  },
  {
    "id": 7,
    "title": "Kaishora Guggulu",
    "description": "Vatshonita, Prameha pidaka, Vrana, Kushta, Sotha, Pandu.",
    "shlok": "वरमहिष लोचनोदर सन्निभवर्णस्य गुग्गुलो प्रस्थम् ।\n                  प्रक्षिप्य तोयराशौ त्रिफलांश्च यथोक्त परिमाणाम् ।।\n                  द्वात्रिंशच्छिन्नरूहापलानि देयानि यत्नेन ।\n                  विपचेदप्यप्रमत्तो दर्व्या सङ्घदृयन् महुर्यावत् ।।\n                 अर्द्धक्षपितं तोयं जातं ज्वलनस्य सम्पर्कात् ।\n                 अवतार्य वस्त्रपूतं पुनरपि संसाधयेत् पात्रे ।।\n                 सान्द्रीभूते तस्मिन्नवतार्य हिमोपलप्रख्ये ।\n                 त्रिफलाचूर्णार्द्धपलं त्रिकटोचूर्णषडक्षपरिमाणम् ।।\n\n\n                 क्रिमिरिपुचूर्णार्द्धपलं कर्ष त्रिवृदन्तयोः ।\n                 अमृतायाः पलमेकं सर्पिषश्च पलाष्टकं क्षिपेदमलम् ।।\n                                                       भै.र. वातरक्ताधिकार 17/103-107",
    "apparatus": [
      "Khalva yantra",
      "Angara kosthi",
      "Steel vessel",
      "Strainer",
      "Ladle"
    ],
    "rawIngredients": [
      {
        "name": "Haritaki",
        "qty": "256 g"
      },
      {
        "name": "Bibhitaki",
        "qty": "256 g"
      },
      {
        "name": "Amalaki",
        "qty": "256 g"
      },
      {
        "name": "Guduchi",
        "qty": "1.536kg"
      },
      {
        "name": "Water",
        "qty": "12.288 lit"
      },
      {
        "name": "Su. Guggulu",
        "qty": "768 g"
      },
      {
        "name": "Triphala",
        "qty": "24 g"
      },
      {
        "name": "Sunthi, Maricha, Pippali each",
        "qty": "24 g"
      },
      {
        "name": "Vidanga",
        "qty": "24 g"
      },
      {
        "name": "Danti, Trivrit each",
        "qty": "12 g"
      },
      {
        "name": "Guduchi",
        "qty": "48 g"
      },
      {
        "name": "Ghrita (Goghrita)",
        "qty": "Q.S."
      }
    ],
    "steps": [
      "Drugs 1 to 4 coarsely powdered and boiled in water till it reduced to 1/4th",
      "The decoction is filtered in another vessel.",
      "Suddha guggul is coarsely pounded and added to the decoction and heated on mandagni, stirring all the while with iron laddle.",
      "When guggle is dissolved completely in kwatha and attains thicker consistency (paka), fine powders of the rest of the drugs are added and mixed uniformly.",
      "The vessel is taken out of agni and the contents are collected into khalva yantra and pounched (kuttan kriya) to soft paste by adding little quantity of ghee.",
      "Finally tablets are prepared, dried and stored in glass bottle."
    ],
    "precautions": [
      "Guggulu before using in the formulations should be properly purified.",
      "When guggulu is dissolved in water and heated, continuous stirring is required.",
      "Guggulu tablets should always be dried in shade."
    ],
    "observations": {
      "rupa": "Black, Smooth rounded",
      "rasa": "Kashaya, Katu",
      "matra": "1-3 g",
      "anupana": "Milk, Warm water, Manjistadi kwatha."
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786382481/kaishora_guggle_iiboe7.mp4"
  },
  {
    "id": 19,
    "title": "Chandana Panaka",
    "description": "Daha, Trishna, Mutravikara, Upadamsa, Jwara.",
    "shlok": "Reference: Anubhuta yoga",
    "apparatus": [
      "Steel vessel",
      "Ladle",
      "Holder",
      "Cloth"
    ],
    "rawIngredients": [
      {
        "name": "Shweta chandana powder",
        "qty": "100 g"
      },
      {
        "name": "Water",
        "qty": "400 ml"
      },
      {
        "name": "Sharkara",
        "qty": "200 g"
      },
      {
        "name": "Jambira swarasa",
        "qty": "10 ml"
      }
    ],
    "steps": [
      "Soak course powder of Sweta chandana with prescribed quantity of water and kept for one night.",
      "Next day morning rub the contents with hands and filter it through the cloth.",
      "To the filtrate add suger and dissolve in it.",
      "At last, add Lemon juice and mixed well and preserved in glass bottle.",
      "Obtained product is called Chandana panaka."
    ],
    "precautions": [
      "Panaka kalpana should be used soon after preparation."
    ],
    "observations": {
      "matra": "2 Pala (96ml)",
      "uses": "Daha, Trishna, Mutravikara, Upadamsa, Jwara etc.",
      "note": "There are no references for Panaka preparation either in Brihatrayis or Laghutrayis . During 20th century. Acharya Yadavji Trikamji has included Panaka kalpas in Ayurvedic pharmaceutics."
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786386609/Preparation_of_Chandana_Panaka_%E0%A4%9A%E0%A4%A8%E0%A5%8D%E0%A4%A6%E0%A4%A8_%E0%A4%AA%E0%A4%BE%E0%A4%A8%E0%A4%95__720p_caption_rcecnk.mp4"
  },
  {
    "id": 11,
    "title": "Atasi Upanaha",
    "description": "Used externally in Vrana, Shotha.",
    "shlok": "अतसी यव गोधुम  चूर्ण मालोडितंद्रवः ।\n                      संपक्वं सौषधस्नेहं वस्त्रेणांतरितं तथा ।। \n                      बध्यते व्रणशोथादानुपनाहः स उच्यते ।।  द्र.गु.वि. उत्तरार्ध",
    "apparatus": [
      "Khalva yantra",
      "Steel vessel",
      "Ladle",
      "Clean cloth",
      "Angara kosthi",
      "Bandage roll"
    ],
    "rawIngredients": [
      {
        "name": "Atasi beej",
        "qty": "50 g"
      },
      {
        "name": "Yava (Barley)",
        "qty": "50 g"
      },
      {
        "name": "Godhuma (Wheat)",
        "qty": "50 g"
      },
      {
        "name": "Haridra",
        "qty": "25 g"
      },
      {
        "name": "Saindhava lavana",
        "qty": "10 g"
      },
      {
        "name": "Tila-Taila",
        "qty": "25 ml"
      },
      {
        "name": "Gomutra or Kanji",
        "qty": "Q.S."
      }
    ],
    "steps": [
      "Drugs 1 to 3 are finely powdered.",
      "These powders are boiled with Gomutra or Kanji.",
      "When the mixture starts boiling, add the fine powders of Haridra & Saindhava lavana and few drops of Tila-taila and prepare the paste.",
      "Thus prepared Atasi upanaha is applied on a cloth and placed over Vranasotha and bandaged."
    ],
    "precautions": [
      "For Upanaha kalpana, fine powders of the drugs should be used.",
      "As this Upanaha is sticky in nature, while boiling continuous stirring is required.",
      "The Upanaha should be used in hot state only."
    ],
    "observations": {
      "rupa": "Yellowish, smooth paste",
      "gandha": "Gomutra or Kanji",
      "use": "It is used externally in Vrana, Shotha.",
      "note": "Upanaha is mentioned as one of the type of Swedana karma (Tapa, Ushma, Upanaha & Dravasweda). Acharya Sushruta has mentioned about Upanaha while explaining Vrana shotha chikitsa. Upanaha should be applied when an abscess is just forming ( Amavastha) or when it is fully developed but not suppurated (Vidagdhavastha)."
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786386255/Atasi_Upanaha_Preparation_Guide_720p_caption_hqpsqq.mp4"
  },
  {
    "id": 28,
    "title": "Kutaja Ghana",
    "description": "Atisara, Grahani, Jvaratisara",
    "shlok": "क्वाथादिनां पुनःपाकात् घनत्वं सा रसक्रियाः ।\n                                                                  शा.स.म.ख.८-१",
    "apparatus": [
      "Gas stove",
      "Steel vessel",
      "Stirrer",
      "Holder",
      "Cotton cloth",
      "Ladle",
      "Knife"
    ],
    "rawIngredients": [
      {
        "name": "Kutaja twaka",
        "qty": "1 part"
      },
      {
        "name": "Water",
        "qty": "768 ml"
      },
      {
        "name": "Ativisha",
        "qty": "12 g"
      }
    ],
    "steps": [
      "The bark of Kutaja is to be cleaned and boiled with the prescribed quantity of water, till it is reduced to 1/8 part of water.",
      "Then the decoction is to be filtered and further boiled over Mandagni. During this process it should be stirred with wooden ladle till it becomes semisolid.",
      "Thereafter it is exposed to sun rays and the powder of Ativisa is added to make pills of 250 mg in weight.",
      "Then the pills are dried in shade and store in an air tight container."
    ],
    "precautions": [
      "Reheating process should be done on mandagni",
      "While reheating continuous stirring is required."
    ],
    "observations": {
      "rupa": "Brownish",
      "rasa": "Tikta",
      "matra": "250 mg to 500 mg",
      "anupana": "Sheetajala",
      "importantTherapeuticUses": "Atisara (Diarrhoea), Grahani (Malabsorption syndrome), Jvaratisāra (Diarrhoea with fever)"
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786439287/Preparation_of_Kutaja_Ghana_720p_caption_efb6lg.mp4"
  },
  {
    "id": 36,
    "title": "Laghusutasekhara Rasa",
    "description": "Sirashoola, Suryavarta, Pittaj chhardi, Travelling sickness, Daha, Swedapravritti.",
    "shlok": "Reference: Rasatantrasara evum Siddhaprayog sangraha    part-1, Kharaliya rasayana        p 546",
    "apparatus": [
      "Khalva yantra",
      "Spoon",
      "Tray"
    ],
    "rawIngredients": [
      {
        "name": "Su. Gairika",
        "qty": "2 Parts"
      },
      {
        "name": "Sunthi Churna",
        "qty": "1 Part"
      },
      {
        "name": "Tambul Patra Swarasa",
        "qty": "Q.S. for bhavana"
      }
    ],
    "steps": [
      "Take the fine powders of Su. Gairika and Sunthi in a prescribed quantity and mix together.",
      "Add Tambul patra swarasa for the mixture and triturate it for 3 days to make a fine paste.",
      "Make the tablets of 2 Ratti (250mg) each and dry in sun."
    ],
    "precautions": [
      "Before use, Gairika should be purified in Goghrita",
      "Sunthi churna should be fine in nature."
    ],
    "observations": {
      "colour": "Rakta varna",
      "gandha": "Sunthi gandha",
      "matra": "125 mg – 250 mg",
      "anupana": "Milk",
      "uses": "Sirashoola, Suryavarta, Pittaj chhardi, Travelling sickness, Daha, Swedapravritti."
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786442010/Preparation_of_Laghusutasekhara_Rasa_1080p_caption_-_Copy_vrfkma.mp4"
  },
  {
    "id": 5,
    "title": "Lavangadi Vati",
    "description": "Kasa, Swasa.",
    "shlok": "तुल्यालवङ्गमरिचाक्षफलत्वचः स्युः\n                         सर्वैः समो निगदितः खदिरस्य सारः ।\n                         बब्बुलवृक्षजकषाय युतश्च चूर्ण\n                         कासान्निहन्ति गुटिका घटिकाऽष्टकान्ते ।।\n                                                 वैद्यजीवनमकासश्वास चिकित्सा",
    "apparatus": [
      "Khalva yantra",
      "Cloth",
      "Steel vessel",
      "Tray"
    ],
    "rawIngredients": [
      {
        "name": "Lavanga (Clove)",
        "qty": "1 Part"
      },
      {
        "name": "Maricha (Black Pepper)",
        "qty": "1 Part"
      },
      {
        "name": "Bibhitaki",
        "qty": "1 Part"
      },
      {
        "name": "Khadir sara",
        "qty": "1 Part"
      },
      {
        "name": "Babbul Twak Kwatha",
        "qty": "Q.S."
      }
    ],
    "steps": [
      "Drugs 1 to 4 are finely powdered and sieved through cloth.",
      "Each drug powder is weighed as per mentioned and mixed together.",
      "The mixture is taken into khalva yantra and triturated with babul twak kwatha to a fine paste.",
      "Finally tables are prepared from the paste, dried in shade and stored."
    ],
    "precautions": [
      "Lavanga should be fried in pan before being made into churna form.",
      "Tablets should be dried in shade.",
      "For the preparation of vati or Guti, the powders used should be very fine. If the course powders are used , prepared tablets becomes rough and crack easily.",
      "When more than one liquid is mentioned for mardana they should be used in succession.",
      "In case no liquid is mentioned, water should be used for mardana.",
      "Sugandhi dravyas like kasturi, Karpura, Hingu etc. if mentioned should be added at the end and ground again."
    ],
    "observations": {
      "rupa": "Smooth, Brownish colour",
      "rasa": "Katu, Kashaya",
      "matra": "3-4 tablets for chewing"
    },
    "videoUrl": "/videos/k.mp4"
  },
  {
    "id": 17,
    "title": "Kharjuradi Mantha",
    "description": "Madatyaya (Madya vikara)",
    "shlok": "जले चतुःपले शीते क्षुण्णं द्रव्यपलं क्षिपेत् । \nमृत्पात्रे मन्थयेत्सम्यक् तस्माच्च व्दिपलं पिबेत् ।।\n                                      शा.स.म.ख. 3/9\nखर्जूरदाडिमद्राक्षातित्तिडिकाम्लि कामलैः ।\nसपरुषैः कृतो मन्थः सर्वमद्यविकारनुत् । ।\n                                    शा.स.म.ख. 3/10",
    "apparatus": [
      "Khalva yantra",
      "Earthen pot (Sharava)",
      "Churner",
      "Clean cloth"
    ],
    "rawIngredients": [
      {
        "name": "Kharjura phala",
        "qty": "10 gm"
      },
      {
        "name": "Dadima beej",
        "qty": "10 gm"
      },
      {
        "name": "Draksha fruit",
        "qty": "10 gm"
      },
      {
        "name": "Tintidika",
        "qty": "10 gm"
      },
      {
        "name": "Cincha phal majja",
        "qty": "10 gm"
      },
      {
        "name": "Amalaki fruit",
        "qty": "10 gm"
      },
      {
        "name": "Parushaka fruit",
        "qty": "10 gm"
      },
      {
        "name": "Water",
        "qty": "280 gm"
      }
    ],
    "steps": [
      "Take the above-said ingredients 1 to 7 in an earthen pot in a crushed form and soak them in a sufficient quantity of cold water.",
      "When the drugs become soft, churn well with churner to a thicker consistency.",
      "If necessary filter it with cloth and use."
    ],
    "precautions": [
      "Though Acharya Sharangadhara has considered Mantha kalpana as Phanta-bheda to prepare Mantha Kalpana, cold water should be used.",
      "Mantha must be of medium consistency. Neither too thick nor too thin",
      "It must be freshly prepared and used."
    ],
    "observations": {
      "rupa": "Thick consistency, Reddish brown",
      "rasa": "Amala, Madhura",
      "gandha": "Amlika",
      "matra": "8 Tola (96ml)",
      "anupana": "Sita, Guda, Madhu",
      "use": "Madatyaya (Madya vikara)"
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786438537/Kharjuradi_Mantha_Preparation_720p_caption_sd7v7g.mp4"
  },
  {
    "id": 31,
    "title": "Narikela Khanda",
    "description": "Amlapitta, Aruchi, Kshayaroga, Raktapitta, Shool roga and chhardi.",
    "shlok": "कुडवमितमिह स्यान्नारिकेलं सुपिष्टं पलपरिमितसर्पिः पाचितं खण्डतुल्यम् ।\n निजपयसि तदेतत् प्रस्थमात्रे विपक्वं गुडवदथ सुशीते शाणभागान् क्षिपेच्च । । 168 ।।\nधन्याकपिप्पलिपयोदतुगाद्विजीरान् शाणं त्रिजातमिभकेशरवद्विचूर्ण्य ।\nहन्त्यम्लपित्तमरुचिं क्षतमस्रपित्तं शूलं वमिं सकलपौरुषकारि हरि । । 169 ।।\n                                                      (भैषज्यरत्नावली, शूलरोगाधिकार; 168-169)",
    "apparatus": [
      "Khalva yantra",
      "Angara kosthi",
      "Cloth",
      "Steel vessel",
      "Ladle",
      "Knife"
    ],
    "rawIngredients": [
      {
        "name": "Coconut powder",
        "qty": "192g"
      },
      {
        "name": "Ghrita (Goghrita)",
        "qty": "48 g"
      },
      {
        "name": "Coconut water",
        "qty": "768 ml"
      },
      {
        "name": "Khanda sita",
        "qty": "192 g"
      },
      {
        "name": "Dhanyaka (Coriander)",
        "qty": "3g"
      },
      {
        "name": "Pippali",
        "qty": "3g"
      },
      {
        "name": "Musta (Nagarmotha)",
        "qty": "3g"
      },
      {
        "name": "Vamshalochana",
        "qty": "3g"
      },
      {
        "name": "Shweta jiraka",
        "qty": "3g"
      },
      {
        "name": "Krishna jiraka",
        "qty": "3g"
      },
      {
        "name": "Twak (Cinnamon)",
        "qty": "3g"
      },
      {
        "name": "Sukshma ela",
        "qty": "3g"
      },
      {
        "name": "Tejapatra",
        "qty": "3g"
      },
      {
        "name": "Nagkeshar",
        "qty": "3g"
      }
    ],
    "steps": [
      "The Grated coconut is taken in a clean vessel and fried with required amount of Ghee until it appears golden brown in color.",
      "In another vessel coconut water and khanda sita is taken together and boiled over mild fire with frequent stirring.",
      "As the boiling material gets thickened and the stage of paka lakshana is attained, the fried grated coconut is added and boiling is continued further.",
      "When an appropriate paka of 2 to 3 thread consistency is attained, the vessel is taken out from the fire and fine powder of prakshepa dravya is added slowely and mixed well to a homogenous mixture.",
      "On cooling it is packed in appropriate wide mouthed container for further therapeutic use."
    ],
    "precautions": [
      "Fried grated coconut should not be burnt.",
      "Add prakshepa dravya only after taking the vessel off the fire."
    ],
    "observations": {
      "rupa": "Light brown, smooth, granular form",
      "rasa": "Madhura",
      "gandha": "Mishra",
      "matra": "6 g to 12 g",
      "anupana": "Water, milk, honey",
      "use": "Amlapitta, Aruchi, Kshayaroga, Raktapitta, Shool roga and chhardi. Its regular use improves the physical strength."
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786454941/Preparation_of_Narikela_Khanda_1080p_caption_gkkpsn.mp4"
  },
  {
    "id": 10,
    "title": "Narikela Lavana",
    "description": "Shula, Parinamashula, Amlapitta",
    "shlok": "नारिकेलं सतोयञ्च लवणेन प्रपूरितम् । \n                      विपक्वमग्निना सम्यक् परिणामजशूलनुत् ।। 81।।\n                      पिप्पल्या भक्षितं हन्ति शूलं विविधहेतुजम् ।\n                      वातिकं पैत्तिकञ्चापि श्लैष्मिकं सान्निपातिकम् ।।82।।\n                                         (भैषज्यरत्नावली, शूलरोगाधिकार, 81-82)",
    "apparatus": [
      "Khalva yantra",
      "Sharavas",
      "Cloth",
      "Clay (Multani Mitti)",
      "Cow dung cakes",
      "Ladle"
    ],
    "rawIngredients": [
      {
        "name": "Ripened coconut fruit with water",
        "qty": "1"
      },
      {
        "name": "Saindhava lavana",
        "qty": "Q.S."
      }
    ],
    "steps": [
      "Take fully ripened coconut fruit containing water and remove all external fibrous part.",
      "Make a hole at one of the eyes.",
      "Through this hole, fill the powdered Saindhava lavana till the water in the coconut rises to the level of the hole.",
      "Close the hole with mud clay and then whole coconut is covered by clay smeared cloth in three consecutive layers and dried.",
      "This is put into a puta of 10-12 cow-dung cakes.",
      "On cooling, the coconut shell is opened and all the contents are finely powdered and stored in an airtight container."
    ],
    "precautions": [
      "Coconut must be taken fully ripened and containing water.",
      "Saindhava must be finely powdered."
    ],
    "observations": {
      "rupa": "Black like Kajjali, smooth",
      "rasa": "Lavana",
      "gandha": "Agnidagdha",
      "matra": "1-2 g",
      "anupana": "Pippali churna, water",
      "use": "Shula, Parinamshula, Amalapitta"
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786439051/narikela_lavana_e8qifk.mp4"
  },
  {
    "id": 37,
    "title": "Navayas Lauha",
    "description": "Pandu, Hridroga, Kustha, Arsha, Kamala",
    "shlok": "त्र्यूषण त्रिफलां मुस्तविडङ्ग चित्रकाः समाः ।\nनवायोरजसो भागास्तच्चूर्ण मधुसर्पिषा ।।\nभैषयेत् पाण्डुहद्रोगकुष्ठार्शः कामलापहम् ।\n                           Charaka Samhita   Chi.16/70-71",
    "apparatus": [
      "Khalva yantra",
      "Spoon",
      "Tray"
    ],
    "rawIngredients": [
      {
        "name": "Sunthi (Dry Ginger)",
        "qty": "1 Part"
      },
      {
        "name": "Maricha (Black Pepper)",
        "qty": "1 Part"
      },
      {
        "name": "Pippali",
        "qty": "1 Part"
      },
      {
        "name": "Amalaki",
        "qty": "1 Part"
      },
      {
        "name": "Haritaki",
        "qty": "1 Part"
      },
      {
        "name": "Bibhitaki",
        "qty": "1 Part"
      },
      {
        "name": "Musta (Nagarmotha)",
        "qty": "1 Part"
      },
      {
        "name": "Vidanga",
        "qty": "1 Part"
      },
      {
        "name": "Chitraka",
        "qty": "1 Part"
      },
      {
        "name": "Lauha Bhasma",
        "qty": "9 Parts"
      }
    ],
    "steps": [
      "Make the fine powders of drugs 1 to 9 separately and mix together.",
      "To this mixture, add equal quantity of Lauha bhasma.",
      "Pound all the drugs to a homogenous mixture and preserve in a container."
    ],
    "precautions": [
      "Keep in dry airtight container to prevent rust/spoilage."
    ],
    "observations": {
      "colour": "Rakta varna",
      "gandha": "Mishra gandha",
      "matra": "250 mg-500 mg",
      "anupana": "Madhu, Ghrita",
      "uses": "Pandu, Hridroga, Kustha, Arsha, Kamala"
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786442549/Navayas_Lauha_Preparation_Guide_1080p_caption_-_Copy_fphf22.mp4"
  },
  {
    "id": 27,
    "title": "Nimbu Sharkara",
    "description": "Mandagni, Aruchi, Trishna, Ajirna, Malavarodha, Raktadoshanashaka, Pittasamaka",
    "shlok": "Reference: Rasatantrasar and Siddhaprayog sangraha part I, p 406.",
    "apparatus": [
      "Gas stove",
      "Steel vessel",
      "Stirrer",
      "Holder",
      "Cotton cloth",
      "Ladle",
      "Knife"
    ],
    "rawIngredients": [
      {
        "name": "Nimbu swarasa",
        "qty": "1 part"
      },
      {
        "name": "Sharkara",
        "qty": "2 parts"
      }
    ],
    "steps": [
      "Take prescribed quantity of Nimbu swarasa in a steel vessel, add double the quantity of suger and boiled over the very mild fire (mandagani) until the liquid attains syrup consistency.",
      "It is later on filtered to get rid of any impurities present in sugar. It is stored glass bottles in a cool dark place with no higher temperature than 25°C."
    ],
    "precautions": [
      "The mixture should be boiled up to 1-2 thread consistency.",
      "The consistency of syrup should be viscous",
      "During Sharkara paka, paka material should settle down without spreading when a few drops of paka is put in a bowl of water.",
      "The product should possess the desired odor and color of the liquid preparation used.",
      "According to Ayurvedasara sangraha by adding nimbu sattva sharkara will not solidifying."
    ],
    "observations": {
      "rupa": "Pale yellow, smooth, semisolid",
      "rasa": "Amla, Madhura",
      "gandha": "Nimbu gandha",
      "matra": "½ to 1 pala (48ml)",
      "anupana": "Water, Godugha or any suitable liquid preparation",
      "shelfLife": "1 year in airtight containers",
      "uses": "Mandagni, Aruchi, Trishna, Ajirna, Malavarodha, Raktadoshanashaka, Pittasamaka"
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786438627/Preparation_of_Nimbu_Sharkara_720p_caption_mtpjbw.mp4"
  },
  {
    "id": 8,
    "title": "Phalavarti",
    "description": "Vibandha, Udavarta.",
    "shlok": "विचा मदनं पिप्पली कुष्ठ गौराश्च सर्षपः ।\n                   गुड क्षार समायुक्ताः फलवर्ति रिहोच्यते ।।\n                                                  भै.र. उदावर्तचिकित्सा 31/10",
    "apparatus": [
      "Khalva yantra",
      "Angara kosthi",
      "Steel vessel",
      "Cloth",
      "Tray"
    ],
    "rawIngredients": [
      {
        "name": "Madanaphala, Pippali, Kustha, Vacha each",
        "qty": "10 g"
      },
      {
        "name": "Sweta sarshapa, Yavakshara",
        "qty": "10 g"
      },
      {
        "name": "Guda (Jaggery)",
        "qty": "10 g"
      },
      {
        "name": "Water",
        "qty": "Q.S."
      }
    ],
    "steps": [
      "Drugs 1 to 6 are finely powered and sieved through a fine cloth.",
      "Guda (Jaggery) is dissolved in water and boiled to thicker consistency on mandagni",
      "Fine powders are added in Gudpaka and mixed well.",
      "Vartis are prepared, dried and stored in an air tight container."
    ],
    "precautions": [
      "Fine powders should be used.",
      "For Gudpaka, Guda should be first dissolved in water, filtered and then boiled on mandagni.",
      "Vartis should be elongated with tapering ends."
    ],
    "observations": {
      "rupa": "Smooth, brownish, elongated with tapering ends.",
      "application": "Used as suppository into the rectum. Immerse in Ghee before slow application."
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786166262/phalavarti_l9jf2h.mp4"
  },
  {
    "id": 34,
    "title": "Rasa Parpati",
    "description": "Grahani, Jwar, Atisara, Ksaya, Kasa, Daha, Sotha, Arsha, Kamala, Sula, Amavata, Amlapitta.",
    "shlok": "द्रुतकञ्जलिका मोचापत्रके चिपटीकृता ।\n                  स पोटः पर्पटी सैव बालाद्यखिलरोगनुत् ।।\n                                                       (र.र.स. 11/72)\n\n   शुद्धे सूते शोधितगन्धकचूर्णेन तुल्यता कार्या । \n   तावन्मर्दनमनयोर्यावन्न कणोऽपि दृश्यते सूते ||414।।\n  पश्चात् कज्जलसदृशं चूर्ण लौहीस्थितं प्रयत्नेन ।\n  निर्धूमबदरकाष्ठाङ्गारे न्यस्तं विलाप्य तैलसमम् ।।415 ।। \n सद्योगोमयनिहिते कदलदले ढालयेन्मृदुनि \n लौहीस्थितमवशिष्टं कठिनं तन्न गृहीतव्यम् । \n पश्चात्पर्पटिरूपा पर्पटिका कीर्त्यते लोकैः । ।416 ।।\n                             (भैषज्यरत्नावली, ग्रहणीरोगाधिकार; 414-416)\n\n                 शुद्धपारदगन्धाभ्यां कृता पर्पटिका नृणाम् ।\n                 निहन्ति ग्रहणी क्षौद्रयुक्ता पथ्यभुजां भृशम् ।।\n                                                 रसचण्डांशु-ग्रहणी चिकित्सा",
    "apparatus": [
      "Mortar & pestle",
      "Palika yantra",
      "Ladle",
      "Valuka yantra",
      "Cow dung",
      "Kadali patra",
      "Angara kosthi"
    ],
    "rawIngredients": [
      {
        "name": "Suddha Parada",
        "qty": "1 Part"
      },
      {
        "name": "Suddha Gandhaka",
        "qty": "1 Part"
      },
      {
        "name": "Ghrita (Goghrita)",
        "qty": "Q.S."
      }
    ],
    "steps": [
      "Take equal quantity of Suddha Parada & Gandhaka in Khalva yantra and prepare Kajjali.",
      "Then it is put in Palika yantra smeared with Ghee.",
      "Apply slow heat directly or preferably through Valuka yantra.",
      "After melting the whole mixture is poured on Kadali patra smeared with Ghee & placed on the cow dung mass.",
      "This may immediately covered with another Kadalipatra containing fresh cow dung and press the melted material gently to give it a parpati shape.",
      "After cooling the flakes or the thin sheets of Parpati may be collected from the leaf & powdered."
    ],
    "precautions": [
      "Slow or moderate heat required. If heat is increased, Kajjali in palika yantra catch fire and start burning, wasting the whole material.",
      "Pouring and pressing should be done quickly."
    ],
    "observations": {
      "observation": "Black coloured thin sheets of Parpati may be obtained. It breaks with cracking sound.",
      "matra": "2 ratti (240 mg)",
      "anupana": "Milk, Butter milk, Honey",
      "vardhamanaParpatiPrayoga": "Rasaparpati is to be given in a dose of 2 ratti on the first day and increased gradually at the rate of 1 ratti per day till it attains a maximum dose of 10 ratti and then reduce gradually by 1 ratti per day to 2 ratti. Repeat the cycle 2-3 times as per disease condition.",
      "uses": "Grahani, Jwar, Atisara, Ksaya, Kasa, Daha, Sotha, Arsha, Kamala, Sula, Amavata, Amlapitta etc."
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786442055/Preparation_of_Rasa_Parpati_1080p_caption_fbspzh.mp4"
  },
  {
    "id": 38,
    "title": "Saptamrita Lauha",
    "description": "Shoola, Amlapitta, Jwara, Mutrasanga",
    "shlok": "मधुकं त्रिफलाचूर्णमयोरजः समं लिहन् । \n             मधुसर्पिर्युतं सम्यग् गव्यं क्षीरं पिवेदनु ॥ १२५॥\n          छर्दि सतिमिरं शूलमम्लपित्तं ज्वरं क्लमम् । \n             आनाहं मूत्रसङ्गञ्च शोथञ्चैव निहन्ति सः ॥१२६॥\n                                            B.R. Shoolrogadhikara 83-84",
    "apparatus": [
      "Khalva yantra",
      "Spoon",
      "Tray"
    ],
    "rawIngredients": [
      {
        "name": "Yastimadhu churna",
        "qty": "1 Part"
      },
      {
        "name": "Haritaki churna",
        "qty": "1 Part"
      },
      {
        "name": "Bibhitaki churna",
        "qty": "1 Part"
      },
      {
        "name": "Amalaki churna",
        "qty": "1 Part"
      },
      {
        "name": "Lauha Bhasma",
        "qty": "1 Part"
      }
    ],
    "steps": [
      "Mix the fine powders of drugs No. 1-4 to Lohabhasma.",
      "Pound all the drugs to form a homogenous mixture and preserve in a container."
    ],
    "precautions": [
      "Keep in dry airtight container."
    ],
    "observations": {
      "colour": "Reddish brown",
      "gandha": "Mishra gandha",
      "matra": "250 mg",
      "anupana": "Madhu, Ghrita, Godugdha",
      "uses": "Shoola, Amlapitta, Jwara, Mutrasanga"
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786442026/Preparation_of_Saptamrita_Lauha_1080p_caption_epo4ar.mp4"
  },
  {
    "id": 18,
    "title": "Chincha Panaka",
    "description": "Grahani, Agnimandya, Aruchi, Vamana, Daha & Trishna.",
    "shlok": "फलमम्लमनम्लं वा शीताम्बुपरिमर्दितम्। \nसितामरीचसंयुक्तं पूतं स्यात् पानकं वरम् ॥\n                                 द्र.गु.वि. परिभाषा प्रकरण 1/30\nभागास्तु पञ्च चिञ्चायाः खण्डस्यापि चतुर्गुणाः । \nधान्यकार्द्रकयोर्भागौ चातुर्जातार्द्धभागिकम् ॥३४॥ \nत्रिगुणं जलमेतेषामेकपात्रे विलोडितम् ।\n पिहितं तप्तदुग्घेन ततो वस्त्रपरिप्लुतम् ॥३५||\n                                  B.R.    Arochaka rogadhikar (18/34-35)",
    "apparatus": [
      "Steel vessel",
      "Stirrer",
      "Cloth"
    ],
    "rawIngredients": [
      {
        "name": "Chincha phala majja",
        "qty": "50 g"
      },
      {
        "name": "Water",
        "qty": "870 ml"
      },
      {
        "name": "Sharkara",
        "qty": "200 g"
      },
      {
        "name": "Dhanyaka (Coriander)",
        "qty": "10 g"
      },
      {
        "name": "Ardraka (Fresh Ginger)",
        "qty": "10 g"
      },
      {
        "name": "Chaturjata",
        "qty": "20 g"
      }
    ],
    "steps": [
      "Soak Chinchaphala majja in a prescribed quantity of water for whole night.",
      "Next day morning, squeeze the contests and filter through a cloth",
      "Add sugar to the filtrate and dissolve in it.",
      "At last, add Dhanyaka, Ardraka, and Chaturjata and mix well and preserved",
      "The obtained product is called Chincha panaka"
    ],
    "precautions": [
      "Panaka kalpana should be consumed fresh or stored appropriately in clean, dry conditions."
    ],
    "observations": {
      "dose": "50 -100 ml with water",
      "properties": "Dipana, Pachana & Grahi",
      "uses": "Grahani, Agnimandya, Aruchi, Vamana, Daha & Trishna."
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786439047/Chincha_Panaka_Preparation_1080p_caption_peguzv.mp4"
  },
  {
    "id": 35,
    "title": "Shweta Parpati",
    "description": "Mutrakricchra, Mutra-ghata, Ashmari, Amlapitta, Agnimandya & Adhmana",
    "shlok": "Reference: Siddha Yoga Sangraha  Ashmari Mutrakruchha Adhikara",
    "apparatus": [
      "Mortar & pestle",
      "Palika yantra",
      "Ladle",
      "Cow dung",
      "Kadali patra"
    ],
    "rawIngredients": [
      {
        "name": "Soraka (KNO3)",
        "qty": "4 Parts (400 g)"
      },
      {
        "name": "Sphatika (Alum)",
        "qty": "1 Part (100 g)"
      },
      {
        "name": "Navasadar (NH4Cl)",
        "qty": "1/4th Part (25 g)"
      },
      {
        "name": "Ghrita (Goghrita)",
        "qty": "Q.S."
      }
    ],
    "steps": [
      "Take all the drug in said proportion and mix well.",
      "Put them in a Palika yantra smeared with Ghee and melt by heating on slow fire.",
      "It is then poured on the Banana leaf smeared with Ghee and placed on the cow-dung mass.",
      "This may immediately cover it with another leaf and press the melted material gently to give it a Parpati shape."
    ],
    "precautions": [
      "All the three ingredients should be taken in pure form.",
      "Maximum 250 g of mixture should be taken in Palika yantra for one preparation.",
      "Pouring & pressing should be done immediately."
    ],
    "observations": {
      "observation": "White coloured thin sheets of Parpati may be obtained. It is the Parpati which does not contain Parada & Gandhaka.",
      "matra": "4-8 Ratti (500 mg - 1 g)",
      "anupana": "Water, Coconut water",
      "uses": "Mutrakricchra, Mutra-ghata, Ashmari, Amlapitta, Agnimandya & Adhmana"
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786438577/Preparation_of_Shweta_Parpati_1080p_caption_cyut1m.mp4"
  },
  {
    "id": 1,
    "title": "Sitopaladi Churna",
    "description": "Swasa, Kasa, Kshaya, Agnimandya, Jwara, Hasta-pada daha, Parshwasula, Urdhavagata raktapitta",
    "shlok": "",
    "apparatus": [
      "Khalva yantra",
      "Cloth",
      "Tray",
      "Spoon"
    ],
    "rawIngredients": [
      {
        "name": "Sita (Sugar candy)",
        "qty": "192 gm"
      },
      {
        "name": "Vamsharochana",
        "qty": "96 gm"
      },
      {
        "name": "Pippali",
        "qty": "48 gm"
      },
      {
        "name": "Ela",
        "qty": "24 gm"
      },
      {
        "name": "Twak (Cinnamon)",
        "qty": "12 gm"
      }
    ],
    "steps": [
      "All the ingredients are cleaned, finely powdered separately.",
      "They are sieved through fine cloth (Vastragalita)",
      "All the powders are mixed together to form homogeneous mixture & stored in a airtight container"
    ],
    "precautions": [
      "If numbers of drugs are more in a given formulation, each drug should be powdered separately, weight the required quantity of drugs and mix them together.",
      "Churnas which are having combination of sugar, salt as an ingredient should not be formulated during rainy season as these ingredients are hygroscopic in nature.",
      "Salt, sugar, camphor etc. when mentioned are separately powdered and mixed with the rest at the end.",
      "Hingu (Asafoetida), Lavanga (clove), Til (season seeds) and salt may also be roasted, powdered and then added.",
      "The powder should be fine of at least 80 mesh sieve.",
      "Churnas always should be kept in airtight-container for its better therapeutic value."
    ],
    "observations": {
      "matra": "1-2 gm with Madhu, Goghrit"
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786380773/sitophaladi_churna_kqiek6.mp4"
  },
  {
    "id": 23,
    "title": "Amruta Ghrita",
    "description": "Amavata (Rheumatism), Vatarakta (Gout), Krimi, Dusta vrana, Adhyavata, Arsha, Gulma.",
    "shlok": "अमृतायाः कषायेण कल्केन च महौषधात् । \n               मृद्वग्निना घृतं प्रस्थं वातरक्तहरं परम् ||५८ ।। \n                                               चक्रदत्त; आमवातचिकित्सा; ५८",
    "apparatus": [
      "Sneha patra",
      "Ladle",
      "Cloth",
      "Angara kosthi",
      "Khalva yantra"
    ],
    "rawIngredients": [
      {
        "name": "Guduchi",
        "qty": "1.536 kg"
      },
      {
        "name": "Water",
        "qty": "12.288 l (reduced to 3.072 l)"
      },
      {
        "name": "Mahaushadha (sunthi)",
        "qty": "128 g"
      },
      {
        "name": "Ghrita (Goghrita)",
        "qty": "768 g"
      }
    ],
    "steps": [
      "First prepare amrita kwatha.",
      "Take prescribed quantity of Goghrita in a Snehapatra, add sunthi kalka and amrita kwatha to it and mix well.",
      "Put the Snehapatra on angar koshti and give moderate heat.",
      "Heating is continued till the water contents are evaporated completely and sneha siddha lakshanas are appeared.",
      "At this stage, Sneha (Ghrita) is filtered and preserved."
    ],
    "precautions": [
      "Maintain moderate heat to ensure complete water evaporation without burning."
    ],
    "observations": {
      "rupa": "Greenish yellow, Smooth, Snigdha",
      "gandha": "Mishra gandha",
      "matra": "12 g",
      "anupana": "Warm milk, Warm water",
      "importantTherapeuticUses": "Amavata (Rheumatism), Vatarakta (Gout), Krimi (Helminthiasis/Worm infestation), Dusta vrana (Non-healing ulcer), Adhyavata (Gout), Arsha (Haemorrhoids), Gulma (Abdominal lump)"
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786296724/Amrita_Ghrita_Ayurvedic_Preparation_Guide_1080p_opkkki.mp4"
  },
  {
    "id": 33,
    "title": "Tribhuvan Kirti Rasa",
    "description": "Vata-kaphaj jwara",
    "shlok": "हिङ्गुलञ्च विषं व्योषं मरिचं टंकण कणा ।\n               जातिकोषसमं  चूर्ण  जम्बीरद्रव मर्दितम् ।।\n\n               रक्तिमानां वटी कुर्यात् खादेदार्द्रकसंयुताम ।\n\n                                                             Rasamrita 9/80-81",
    "apparatus": [
      "Khalva yantra",
      "Ladle",
      "Tray"
    ],
    "rawIngredients": [
      {
        "name": "Su. Hingula",
        "qty": "1 Part"
      },
      {
        "name": "Su. Vatsanabha",
        "qty": "1 Part"
      },
      {
        "name": "Sunthi (Dry Ginger)",
        "qty": "1 Part"
      },
      {
        "name": "Maricha (Black Pepper)",
        "qty": "1 Part"
      },
      {
        "name": "Pippali",
        "qty": "1 Part"
      },
      {
        "name": "Su. Tankana",
        "qty": "1 Part"
      },
      {
        "name": "Pippali mula",
        "qty": "1 Part"
      },
      {
        "name": "Tulsi swarasa",
        "qty": "Q.S."
      },
      {
        "name": "Ardraka swarasa",
        "qty": "Q.S."
      },
      {
        "name": "Dhattura patra swarasa",
        "qty": "Q.S."
      },
      {
        "name": "Nirgundi swarasa",
        "qty": "Q.S."
      }
    ],
    "steps": [
      "Make the fine powders of all the ingredients separately.",
      "Add them together and mix thoroughly.",
      "Triturate the mixture with Tulsi swarasa, Ardraka swarasa, Dhattura patra swarasa and Nirgundi swarasa, one by one for three days each.",
      "At last, make the pills of 125 mg then dried."
    ],
    "precautions": [
      "For each bhavana, swarasa should be taken fresh"
    ],
    "observations": {
      "varna": "Reddish brown",
      "gandha": "Trikatu gandha",
      "matra": "125 mg – 250 mg",
      "anupana": "Madhu, Ardraka swarasa, Tulsi swarasa",
      "uses": "Vata-kaphaj jwara"
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786380848/Tribhuvana_Kirti_Rasa_Preparation_1080p_caption_1_wykaax.mp4"
  },
  {
    "id": 24,
    "title": "Ksheera Bala Taila",
    "description": "Vatarakta, Vata roga, Sukra dosa, Rojodosa, Karshya, Swarabheda, used as Rasayana.",
    "shlok": "बलाकषाय कल्काभ्यां तैलं क्षीरसमं पचेत् । ।  \n                                            अष्टांगहृदय चि. 22/44",
    "apparatus": [
      "Khalva yantra",
      "Angara kosthi",
      "Sneha patra",
      "Ladle",
      "Cloth"
    ],
    "rawIngredients": [
      {
        "name": "Bala Kashaya",
        "qty": "16 Parts"
      },
      {
        "name": "Bala Kalka",
        "qty": "1 Parts"
      },
      {
        "name": "Tila-Taila",
        "qty": "4 Parts"
      },
      {
        "name": "Godugdha (Cow's milk)",
        "qty": "4 Parts"
      }
    ],
    "steps": [
      "Take all the ingredients in Sneha patra and mix together and boil on moderate fire.",
      "Heating is continued till all the water contents are evaporated and taila siddhi lakshans are seen.",
      "On cooling, taila is filtered and preserved."
    ],
    "precautions": [
      "Avoid high heat. Slow evaporation is key."
    ],
    "observations": {
      "rupa": "Light brown",
      "rasa": "Katu",
      "matra": "12 g Also used for Abhyanga and Nasya."
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786382728/kasheerbaila_taila_dqcexy.mp4"
  },
  {
    "id": 6,
    "title": "Triphala Guggulu",
    "description": "Bhagandara, Gulma, Sotha, Arsha.",
    "shlok": "त्रिपलं त्रिफलाचूर्ण  कृष्णाचूर्ण पलोन्मितम् ।\nगुग्गुलुं पाञ्चपलिकं क्षोददयेत्सर्वमेकतः । \nततस्तु गुटिका कृत्वा प्रयुञ्जयात् वन्हयपेक्षया ।\nभगन्दरं गुल्म शोथ अर्शासि च विनाशयेत् ।।\n                                 शा.स.म.ख. ७/८२-८३",
    "apparatus": [
      "Khalva yantra",
      "Angara kosthi",
      "Steel vessel",
      "Ladle",
      "Cloth"
    ],
    "rawIngredients": [
      {
        "name": "Haritaki churna",
        "qty": "1 Pala"
      },
      {
        "name": "Bibhitaki churna",
        "qty": "1 Pala"
      },
      {
        "name": "Amalaki churna",
        "qty": "1 Pala"
      },
      {
        "name": "Pippali churna",
        "qty": "1 Pala"
      },
      {
        "name": "Su. Guggulu",
        "qty": "5 Pala"
      },
      {
        "name": "Water",
        "qty": "Q.S"
      }
    ],
    "steps": [
      "Suddha guggulu is taken in a vessel and little amount of water is added and boiled over mandagni till it is completely dissolved",
      "Then the fine powders of drugs 1 to 4 are added and the contents are mixed thoroughly.",
      "Vessel is taken out and the contents are collected into Khalva yantra and pounded to soft paste by adding little quantity of ghee.",
      "Finally tablets are made and stored in a airtight container after drying."
    ],
    "precautions": [
      "Guggulu before using in the formulations should be properly purified.",
      "When guggulu is dissolved in water and heated, continuous stirring is required.",
      "Guggulu tablets should always be dried in shade."
    ],
    "observations": {
      "rupa": "Blackish, smooth, round shape",
      "rasa": "Katu, Tikta, Ksashaya",
      "matra": "1-3 g",
      "anupana": "Ushnodaka, Vranaropaka dravya kwatha"
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786438355/triphala_guggle_iukqhh.mp4"
  },
  {
    "id": 12,
    "title": "Dashanasamskara churna",
    "description": "Danta roga, Bleeding gums, Stomatitis, Halitosis.",
    "shlok": "शुण्ठी हरीतकी मुस्ता खदिरं घनसारकम् । \n                     गुवाकभस्म मरिचं देवपुष्यं तथा त्वचम्॥ \n                     एतेषां समभागेन चूर्णमेवं विनिर्दिशेत् । \n                     तत्समं प्रक्षिपेत्तत्र चूर्णं कठिनिसम्भवम् ॥\n                     एतद् दशनसंस्कारचूर्णं दन्तास्यरोगजित् ॥ \n                                                      B. R. Mukharogādhikāra (61/91-92)",
    "apparatus": [
      "Khalva yantra",
      "Cloth",
      "Tray",
      "Sieve",
      "Spoon"
    ],
    "rawIngredients": [
      {
        "name": "Sunthi (Dry Ginger)",
        "qty": "1 part"
      },
      {
        "name": "Haritaki",
        "qty": "1 part"
      },
      {
        "name": "Musta (Nagarmotha)",
        "qty": "1 part"
      },
      {
        "name": "Khadir sara",
        "qty": "1 part"
      },
      {
        "name": "Karpura (Camphor)",
        "qty": "1 part"
      },
      {
        "name": "Puga (Guvaka) bhasma",
        "qty": "1 part"
      },
      {
        "name": "Maricha (Black Pepper)",
        "qty": "1 part"
      },
      {
        "name": "Lavanga (Clove)",
        "qty": "1 part"
      },
      {
        "name": "Twak (Cinnamon)",
        "qty": "1 part"
      },
      {
        "name": "Khatika (Chalk)",
        "qty": "9 parts"
      }
    ],
    "steps": [
      "All the ingredients are cleaned, finely powdered separately.",
      "They are sieved through fine cloth (Vastragalita)",
      "All the powders except karpura are mixed together to form homogeneous mixture",
      "At last, karpura is added, mixed thoroughly & stored in a airtight container"
    ],
    "precautions": [
      "If numbers of drugs are more in a given formulation, each drug should be powdered separately, weight the required quantity of drugs and mix them together.",
      "Churnas which are having combination of sugar, salt as an ingredient should not be formulated during rainy season as these ingredients are hygroscopic in nature.",
      "Salt, sugar, camphor etc. when mentioned are separately powdered and mixed with the rest at the end.",
      "Hingu (Asafoetida), Lavanga (clove), Til (season seeds) and salt may also be roasted, powdered and then added.",
      "The powder should be fine of at least 80 mesh sieve.",
      "Churnas always should be kept in airtight-container for its better therapeutic value."
    ],
    "observations": {
      "properties": "The product will be whitish coloured powder with katu rasa and karpúra gandha.",
      "matra": "Q.S. for Dantamanjana",
      "uses": "This powder is used for gentle massage over gums and enamels. It is indicated for 'dantamañjana' in all types of ‘danta roga’. It cures 'bleeding gums', 'stomatitis' and 'halitosis' (foul mouth)."
    },
    "videoUrl": "https://res.cloudinary.com/npnav2np/video/upload/v1786438963/Preparation_of_Dashanasamskara_Churna_720p_caption_kuqhyt.mp4"
  }
];

const defaultInventoryItems = [
  {
    "id": "sita",
    "name": "Sita (Sugar candy)",
    "type": "herb",
    "amount": 192,
    "iconName": "Leaf",
    "image": "/assets/inventory/sita.png"
  },
  {
    "id": "pippali",
    "name": "Pippali",
    "type": "herb",
    "amount": 48,
    "iconName": "Leaf",
    "image": "/assets/inventory/pippali.png"
  },
  {
    "id": "pippali_churna",
    "name": "Pippali churna",
    "type": "herb",
    "amount": 10,
    "iconName": "Leaf",
    "image": "/assets/inventory/pippali_churna.png"
  },
  {
    "id": "pippalimula",
    "name": "Pippali mula",
    "type": "herb",
    "amount": 10,
    "iconName": "Leaf",
    "image": "/assets/inventory/pippalimula.png"
  },
  {
    "id": "ela",
    "name": "Sukshma ela",
    "type": "herb",
    "amount": 24,
    "iconName": "Leaf",
    "image": "/assets/inventory/ela.png"
  },
  {
    "id": "twak",
    "name": "Twak (Cinnamon)",
    "type": "herb",
    "amount": 12,
    "iconName": "Leaf",
    "image": "/assets/inventory/twak.png"
  },
  {
    "id": "sunthi",
    "name": "Sunthi (Dry Ginger)",
    "type": "herb",
    "amount": 30,
    "iconName": "Leaf",
    "image": "/assets/inventory/sunthi.png"
  },
  {
    "id": "maricha",
    "name": "Maricha (Black Pepper)",
    "type": "herb",
    "amount": 30,
    "iconName": "Leaf",
    "image": "/assets/inventory/maricha.png"
  },
  {
    "id": "ajmoda",
    "name": "Ajmoda",
    "type": "herb",
    "amount": 30,
    "iconName": "Leaf",
    "image": "/assets/inventory/ajmoda.png"
  },
  {
    "id": "shweta_jiraka",
    "name": "Shweta jiraka",
    "type": "herb",
    "amount": 30,
    "iconName": "Leaf",
    "image": "/assets/inventory/shweta_jiraka.png"
  },
  {
    "id": "krishna_jiraka",
    "name": "Krishna jiraka",
    "type": "herb",
    "amount": 30,
    "iconName": "Leaf",
    "image": "/assets/inventory/krishna_jiraka.png"
  },
  {
    "id": "hingu",
    "name": "Su. Hingu (Asafoetida)",
    "type": "herb",
    "amount": 30,
    "iconName": "Leaf",
    "image": "/assets/inventory/hingu.png"
  },
  {
    "id": "haritaki",
    "name": "Haritaki",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/haritaki.png"
  },
  {
    "id": "bibhitaki",
    "name": "Bibhitaki",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/bibhitaki.png"
  },
  {
    "id": "amalaki",
    "name": "Amalaki",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/amalaki.png"
  },
  {
    "id": "chitraka",
    "name": "Chitraka",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/chitraka.png"
  },
  {
    "id": "chavya",
    "name": "Chavya",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/chavya.png"
  },
  {
    "id": "lavanga",
    "name": "Lavanga (Clove)",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/lavanga.png"
  },
  {
    "id": "khadir_sara",
    "name": "Khadir sara",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/khadir_sara.png"
  },
  {
    "id": "madanaphala",
    "name": "Madanaphala",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/madanaphala.png"
  },
  {
    "id": "kustha",
    "name": "Kustha",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/kustha.png"
  },
  {
    "id": "vacha",
    "name": "Vacha",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/vacha.png"
  },
  {
    "id": "sweta_sarshapa",
    "name": "Sweta sarshapa",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/sweta_sarshapa.png"
  },
  {
    "id": "yavakshara",
    "name": "Yavakshara",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/yavakshara.png"
  },
  {
    "id": "vidanga",
    "name": "Vidanga",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/vidanga.png"
  },
  {
    "id": "triphala",
    "name": "Triphala",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/triphala.png"
  },
  {
    "id": "trikatu",
    "name": "Trikatu",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/trikatu.png"
  },
  {
    "id": "guda",
    "name": "Guda (Jaggery)",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/guda.png"
  },
  {
    "id": "shankhanabhi",
    "name": "Shankhanabhi",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/shankhanabhi.png"
  },
  {
    "id": "arka_patra",
    "name": "Arka Patra",
    "type": "herb",
    "amount": 150,
    "iconName": "Leaf",
    "image": "/assets/inventory/arka_patra.png"
  },
  {
    "id": "atasi_beej",
    "name": "Atasi beej",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/atasi_beej.png"
  },
  {
    "id": "yava",
    "name": "Yava (Barley)",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/yava.png"
  },
  {
    "id": "godhuma",
    "name": "Godhuma (Wheat)",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/godhuma.png"
  },
  {
    "id": "haridra",
    "name": "Haridra",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/haridra.png"
  },
  {
    "id": "manjistha",
    "name": "Manjistha",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/manjistha.png"
  },
  {
    "id": "lodhra",
    "name": "Lodhra",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/lodhra.png"
  },
  {
    "id": "hribera",
    "name": "Hribera",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/hribera.png"
  },
  {
    "id": "daruharidra",
    "name": "Daruharidra",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/daruharidra.png"
  },
  {
    "id": "jatamamsi",
    "name": "Jatamamsi",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/jatamamsi.png"
  },
  {
    "id": "raktachandana",
    "name": "Raktachandana",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/raktachandana.png"
  },
  {
    "id": "musta",
    "name": "Musta (Nagarmotha)",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/musta.png"
  },
  {
    "id": "indrayava",
    "name": "Indrayava",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/indrayava.png"
  },
  {
    "id": "parpataka",
    "name": "Parpataka",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/parpataka.png"
  },
  {
    "id": "usheer",
    "name": "Usheer",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/usheer.png"
  },
  {
    "id": "shweta_chandana",
    "name": "Shweta chandana",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/shweta_chandana.png"
  },
  {
    "id": "shweta_chandana_powder",
    "name": "Shweta chandana powder",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/shweta_chandana_powder.png"
  },
  {
    "id": "draksha",
    "name": "Draksha",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/draksha.png"
  },
  {
    "id": "dhanyaka",
    "name": "Dhanyaka (Coriander)",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/dhanyaka.png"
  },
  {
    "id": "ardraka",
    "name": "Ardraka (Ginger)",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/ardraka.png"
  },
  {
    "id": "chaturjata",
    "name": "Chaturjata",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/chaturjata.png"
  },
  {
    "id": "sweta_sariva",
    "name": "Sweta sariva",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/sweta_sariva.png"
  },
  {
    "id": "krishna_sariva",
    "name": "Krishna sariva",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/krishna_sariva.png"
  },
  {
    "id": "nagakeshara",
    "name": "Nagakeshara",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/nagakeshara.png"
  },
  {
    "id": "prapaundarika",
    "name": "Prapaundarika",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/prapaundarika.png"
  },
  {
    "id": "guduchi",
    "name": "Guduchi",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/guduchi.png"
  },
  {
    "id": "bala",
    "name": "Bala",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/bala.png"
  },
  {
    "id": "kharjura_phala",
    "name": "Kharjura phala",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/kharjura_phala.png"
  },
  {
    "id": "ripened_coconut",
    "name": "Ripened coconut",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/ripened_coconut.png"
  },
  {
    "id": "coconut_powder",
    "name": "Coconut powder",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/coconut_powder.png"
  },
  {
    "id": "trijata",
    "name": "Trijata",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/trijata.png"
  },
  {
    "id": "yastimadhu",
    "name": "Yastimadhu",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/yastimadhu.png"
  },
  {
    "id": "karpura",
    "name": "Karpura (Camphor)",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/karpura.png"
  },
  {
    "id": "khatika",
    "name": "Khatika (Chalk)",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/khatika.png"
  },
  {
    "id": "girisindura",
    "name": "Girisindura",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/girisindura.png"
  },
  {
    "id": "sirisha_twaka",
    "name": "Sirisha twaka",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/sirisha_twaka.png"
  },
  {
    "id": "valaka",
    "name": "Valaka",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/valaka.png"
  },
  {
    "id": "su_gairika",
    "name": "Su. Gairika",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/su_gairika.png"
  },
  {
    "id": "dadima_beej",
    "name": "Dadima beej",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/dadima_beej.png"
  },
  {
    "id": "water",
    "name": "Water",
    "type": "liquid",
    "amount": 500,
    "iconName": "Droplet",
    "image": "/assets/inventory/water.png"
  },
  {
    "id": "jambira_swarasa",
    "name": "Jambira swarasa",
    "type": "liquid",
    "amount": 200,
    "iconName": "Droplet",
    "image": "/assets/inventory/jambira_swarasa.png"
  },
  {
    "id": "matulunga_swarasa",
    "name": "Matulunga swarasa",
    "type": "liquid",
    "amount": 200,
    "iconName": "Droplet",
    "image": "/assets/inventory/matulunga_swarasa.png"
  },
  {
    "id": "babbul_kwatha",
    "name": "Babbul Twak Kwatha",
    "type": "liquid",
    "amount": 50,
    "iconName": "Droplet",
    "image": "/assets/inventory/babbul_kwatha.png"
  },
  {
    "id": "bala_kashaya",
    "name": "Bala Kashaya",
    "type": "liquid",
    "amount": 200,
    "iconName": "Droplet",
    "image": "/assets/inventory/bala_kashaya.png"
  },
  {
    "id": "arkapatra_swarasa",
    "name": "Arkapatra swarasa",
    "type": "liquid",
    "amount": 200,
    "iconName": "Droplet",
    "image": "/assets/inventory/arkapatra_swarasa.png"
  },
  {
    "id": "vasa_swarasa",
    "name": "Vasa swarasa",
    "type": "liquid",
    "amount": 200,
    "iconName": "Droplet",
    "image": "/assets/inventory/vasa_swarasa.png"
  },
  {
    "id": "nimbu_swarasa",
    "name": "Nimbu swarasa",
    "type": "liquid",
    "amount": 200,
    "iconName": "Droplet",
    "image": "/assets/inventory/nimbu_swarasa.png"
  },
  {
    "id": "coconut_water",
    "name": "Coconut water",
    "type": "liquid",
    "amount": 200,
    "iconName": "Droplet",
    "image": "/assets/inventory/coconut_water.png"
  },
  {
    "id": "tulsi_swarasa",
    "name": "Tulsi swarasa",
    "type": "liquid",
    "amount": 200,
    "iconName": "Droplet",
    "image": "/assets/inventory/tulsi_swarasa.png"
  },
  {
    "id": "ardraka_swarasa",
    "name": "Ardraka swarasa",
    "type": "liquid",
    "amount": 200,
    "iconName": "Droplet",
    "image": "/assets/inventory/ardraka_swarasa.png"
  },
  {
    "id": "dhattura_patra_swarasa",
    "name": "Dhattura patra swarasa",
    "type": "liquid",
    "amount": 200,
    "iconName": "Droplet",
    "image": "/assets/inventory/dhattura_patra_swarasa.png"
  },
  {
    "id": "nirgundi_swarasa",
    "name": "Nirgundi swarasa",
    "type": "liquid",
    "amount": 200,
    "iconName": "Droplet",
    "image": "/assets/inventory/nirgundi_swarasa.png"
  },
  {
    "id": "tambul_patra_swarasa",
    "name": "Tambul Patra Swarasa",
    "type": "liquid",
    "amount": 200,
    "iconName": "Droplet",
    "image": "/assets/inventory/tambul_patra_swarasa.png"
  },
  {
    "id": "godugdha",
    "name": "Godugdha (Cow's milk)",
    "type": "liquid",
    "amount": 500,
    "iconName": "Droplet",
    "image": "/assets/inventory/godugdha.png"
  },
  {
    "id": "khalva_yantra",
    "name": "Khalva yantra",
    "type": "utensil",
    "amount": null,
    "iconName": "Database",
    "image": "/assets/inventory/khalva_yantra.png"
  },
  {
    "id": "mortar_pestle",
    "name": "Mortar & pestle",
    "type": "utensil",
    "amount": null,
    "iconName": "Database",
    "image": "/assets/inventory/mortar_pestle.png"
  },
  {
    "id": "cloth",
    "name": "Cloth",
    "type": "utensil",
    "amount": null,
    "iconName": "Database",
    "image": "/assets/inventory/cloth.png"
  },
  {
    "id": "clean_cloth",
    "name": "Clean cloth",
    "type": "utensil",
    "amount": null,
    "iconName": "Database",
    "image": "/assets/inventory/clean_cloth.png"
  },
  {
    "id": "cotton_cloth",
    "name": "Cotton cloth",
    "type": "utensil",
    "amount": null,
    "iconName": "Database",
    "image": "/assets/inventory/cotton_cloth.png"
  },
  {
    "id": "tray",
    "name": "Tray",
    "type": "utensil",
    "amount": null,
    "iconName": "Database",
    "image": "/assets/inventory/tray.png"
  },
  {
    "id": "spoon",
    "name": "Spoon",
    "type": "utensil",
    "amount": null,
    "iconName": "Database",
    "image": "/assets/inventory/spoon.png"
  },
  {
    "id": "steel_vessel",
    "name": "Steel vessel",
    "type": "utensil",
    "amount": null,
    "iconName": "Beaker",
    "image": "/assets/inventory/steel_vessel.png"
  },
  {
    "id": "iron_khalva_yantra",
    "name": "Iron khalva yantra",
    "type": "utensil",
    "amount": null,
    "iconName": "Database",
    "image": "/assets/inventory/iron_khalva_yantra.png"
  },
  {
    "id": "angara_kosthi",
    "name": "Angara kosthi",
    "type": "utensil",
    "amount": null,
    "iconName": "Flame",
    "image": "/assets/inventory/angara_kosthi.png"
  },
  {
    "id": "earthen_pot",
    "name": "Earthen pot (Sharava)",
    "type": "utensil",
    "amount": null,
    "iconName": "Beaker",
    "image": "/assets/inventory/earthen_pot.png"
  },
  {
    "id": "palika_yantra",
    "name": "Palika yantra",
    "type": "utensil",
    "amount": null,
    "iconName": "Database",
    "image": "/assets/inventory/palika_yantra.png"
  },
  {
    "id": "valuka_yantra",
    "name": "Valuka yantra",
    "type": "utensil",
    "amount": null,
    "iconName": "Database",
    "image": "/assets/inventory/valuka_yantra.png"
  },
  {
    "id": "taila_patra",
    "name": "Taila-patra",
    "type": "utensil",
    "amount": null,
    "iconName": "Beaker",
    "image": "/assets/inventory/taila_patra.png"
  },
  {
    "id": "sneha_patra",
    "name": "Sneha patra",
    "type": "utensil",
    "amount": null,
    "iconName": "Beaker",
    "image": "/assets/inventory/sneha_patra.png"
  },
  {
    "id": "ladle",
    "name": "Ladle",
    "type": "utensil",
    "amount": null,
    "iconName": "Database",
    "image": "/assets/inventory/ladle.png"
  },
  {
    "id": "strainer",
    "name": "Strainer",
    "type": "utensil",
    "amount": null,
    "iconName": "Database",
    "image": "/assets/inventory/strainer.png"
  },
  {
    "id": "sieve",
    "name": "Sieve",
    "type": "utensil",
    "amount": null,
    "iconName": "Database",
    "image": "/assets/inventory/sieve.png"
  },
  {
    "id": "stirrer",
    "name": "Stirrer",
    "type": "utensil",
    "amount": null,
    "iconName": "Database",
    "image": "/assets/inventory/stirrer.png"
  },
  {
    "id": "wide_mouth_glass_bottle",
    "name": "Wide mouth glass bottle",
    "type": "utensil",
    "amount": null,
    "iconName": "Database",
    "image": "/assets/inventory/wide_mouth_glass_bottle.png"
  },
  {
    "id": "churner",
    "name": "Churner",
    "type": "utensil",
    "amount": null,
    "iconName": "Database",
    "image": "/assets/inventory/churner.png"
  },
  {
    "id": "gas_stove",
    "name": "Gas stove",
    "type": "utensil",
    "amount": null,
    "iconName": "Flame",
    "image": "/assets/inventory/gas_stove.png"
  },
  {
    "id": "cow_dung",
    "name": "Cow dung cakes",
    "type": "utensil",
    "amount": null,
    "iconName": "Database",
    "image": "/assets/inventory/cow_dung.png"
  },
  {
    "id": "kadali_patra",
    "name": "Kadali patra",
    "type": "utensil",
    "amount": null,
    "iconName": "Leaf",
    "image": "/assets/inventory/kadali_patra.png"
  },
  {
    "id": "drying_tray",
    "name": "Drying tray",
    "type": "utensil",
    "amount": null,
    "iconName": "Database",
    "image": "/assets/inventory/drying_tray.png"
  },
  {
    "id": "holder",
    "name": "Holder",
    "type": "utensil",
    "amount": null,
    "iconName": "Database",
    "image": "/assets/inventory/holder.png"
  },
  {
    "id": "bandage_roll",
    "name": "Bandage roll",
    "type": "utensil",
    "amount": null,
    "iconName": "Database",
    "image": "/assets/inventory/bandage_roll.png"
  },
  {
    "id": "furnace_puta",
    "name": "Furnace (Puta)",
    "type": "utensil",
    "amount": null,
    "iconName": "Flame",
    "image": "/assets/inventory/furnace_puta.png"
  },
  {
    "id": "ghrita",
    "name": "Ghrita (Goghrita)",
    "type": "liquid",
    "amount": 200,
    "iconName": "Droplet",
    "image": "/assets/inventory/ghrita.png"
  },
  {
    "id": "tila_taila",
    "name": "Tila-Taila",
    "type": "liquid",
    "amount": 200,
    "iconName": "Droplet",
    "image": "/assets/inventory/tila_taila.png"
  },
  {
    "id": "sarshapa_taila",
    "name": "Sarshapa Taila",
    "type": "liquid",
    "amount": 200,
    "iconName": "Droplet",
    "image": "/assets/inventory/sarshapa_taila.png"
  },
  {
    "id": "siktha_taila",
    "name": "Siktha Taila",
    "type": "liquid",
    "amount": 200,
    "iconName": "Droplet",
    "image": "/assets/inventory/siktha_taila.png"
  },
  {
    "id": "su_parada",
    "name": "Suddha Parada",
    "type": "herb",
    "amount": 10,
    "iconName": "Leaf",
    "image": "/assets/inventory/su_parada.png"
  },
  {
    "id": "su_gandhaka",
    "name": "Suddha Gandhaka",
    "type": "herb",
    "amount": 10,
    "iconName": "Leaf",
    "image": "/assets/inventory/su_gandhaka.png"
  },
  {
    "id": "su_hingula",
    "name": "Su. Hingula",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/su_hingula.png"
  },
  {
    "id": "tankan_bhasma",
    "name": "Su. Tankana",
    "type": "herb",
    "amount": 10,
    "iconName": "Leaf",
    "image": "/assets/inventory/tankan_bhasma.png"
  },
  {
    "id": "su_vishamusti",
    "name": "Su. Vishamusti",
    "type": "herb",
    "amount": 10,
    "iconName": "Leaf",
    "image": "/assets/inventory/su_vishamusti.png"
  },
  {
    "id": "soraka_kno3",
    "name": "Soraka (KNO3)",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/soraka_kno3.png"
  },
  {
    "id": "sphatika_alum",
    "name": "Sphatika (Alum)",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/sphatika_alum.png"
  },
  {
    "id": "navasadar_nh4cl",
    "name": "Navasadar (NH4Cl)",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/navasadar_nh4cl.png"
  },
  {
    "id": "lauha_bhasma",
    "name": "Lauha Bhasma",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/lauha_bhasma.png"
  },
  {
    "id": "saindhava_lavana",
    "name": "Saindhava Lavana",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/saindhava_lavana.png"
  },
  {
    "id": "su_vatsanabh",
    "name": "Su Vatsanabh",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/su_vatsanabh.png"
  },
  {
    "id": "svarji_kshara",
    "name": "Svarji Kshara",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/svarji_kshara.png"
  },
  {
    "id": "sauvarchal_lavana",
    "name": "Sauvarchal Lavana",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/sauvarchal_lavana.png"
  },
  {
    "id": "samudra_lavana",
    "name": "Samudra Lavana",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/samudra_lavana.png"
  },
  {
    "id": "sarji_kshara",
    "name": "Sarji Kshara",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/sarji_kshara.png"
  },
  {
    "id": "vid_lavana",
    "name": "Vid Lavana",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/vid_lavana.png"
  },
  {
    "id": "audbhida_lavana",
    "name": "Audbhida Lavana",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/audbhida_lavana.png"
  },
  {
    "id": "guggulu",
    "name": "Guggulu",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/guggulu.png"
  },
  {
    "id": "manashila",
    "name": "Manashila",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/manashila.png"
  },
  {
    "id": "aja_dugdha",
    "name": "Aja Dugdha",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/aja_dugdha.png"
  },
  {
    "id": "madhu",
    "name": "Madhu",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/madhu.png"
  },
  {
    "id": "gomutra",
    "name": "Gomutra",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/gomutra.png"
  },
  {
    "id": "khadira_sara",
    "name": "Khadira Sara",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/khadira_sara.png"
  },
  {
    "id": "puga_bhasma",
    "name": "Puga Bhasma",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/puga_bhasma.png"
  },
  {
    "id": "tankana",
    "name": "Tankana",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/tankana.png"
  },
  {
    "id": "madhuyasti",
    "name": "Madhuyasti",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/madhuyasti.png"
  },
  {
    "id": "tagar",
    "name": "Tagar",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/tagar.png"
  },
  {
    "id": "chandana",
    "name": "Chandana",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/chandana.png"
  },
  {
    "id": "rhibera",
    "name": "Rhibera",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/rhibera.png"
  },
  {
    "id": "nagara",
    "name": "Nagara",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/nagara.png"
  },
  {
    "id": "tintidika",
    "name": "Tintidika",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/tintidika.png"
  },
  {
    "id": "parushaka",
    "name": "Parushaka",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/parushaka.png"
  },
  {
    "id": "chincha_phal_majja",
    "name": "Chincha Phal Majja",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/chincha_phal_majja.png"
  },
  {
    "id": "sharkara",
    "name": "Sharkara",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/sharkara.png"
  },
  {
    "id": "jambira_rasa",
    "name": "Jambira Rasa",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/jambira_rasa.png"
  },
  {
    "id": "goghrita",
    "name": "Goghrita",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/goghrita.png"
  },
  {
    "id": "shuchipushpa",
    "name": "Shuchipushpa",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/shuchipushpa.png"
  },
  {
    "id": "vatapraroha",
    "name": "Vatapraroha",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/vatapraroha.png"
  },
  {
    "id": "nalika",
    "name": "Nalika",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/nalika.png"
  },
  {
    "id": "katurohini",
    "name": "Katurohini",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/katurohini.png"
  },
  {
    "id": "nilotpala",
    "name": "Nilotpala",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/nilotpala.png"
  },
  {
    "id": "triphala_rasa",
    "name": "Triphala Rasa",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/triphala_rasa.png"
  },
  {
    "id": "amrita_kwatha",
    "name": "Amrita Kwatha",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/amrita_kwatha.png"
  },
  {
    "id": "haridra_kalka",
    "name": "Haridra Kalka",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/haridra_kalka.png"
  },
  {
    "id": "kutaja_twaka",
    "name": "Kutaja Twaka",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/kutaja_twaka.png"
  },
  {
    "id": "atisa_curna",
    "name": "Atisa Curna",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/atisa_curna.png"
  },
  {
    "id": "trivritta",
    "name": "Trivritta",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/trivritta.png"
  },
  {
    "id": "khanda_sita",
    "name": "Khanda Sita",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/khanda_sita.png"
  },
  {
    "id": "vamshalochana",
    "name": "Vamshalochana",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/vamshalochana.png"
  },
  {
    "id": "tejapatra",
    "name": "Tejapatra",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/tejapatra.png"
  },
  {
    "id": "nagakeshar",
    "name": "Nagakeshar",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/nagakeshar.png"
  },
  {
    "id": "su_vatsanabha",
    "name": "Su Vatsanabha",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/su_vatsanabha.png"
  },
  {
    "id": "jatikosha",
    "name": "Jatikosha",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/jatikosha.png"
  },
  {
    "id": "triphala_kashaya",
    "name": "Triphala Kashaya",
    "type": "liquid",
    "amount": 100,
    "iconName": "Droplet",
    "image": "/assets/inventory/triphala_kashaya.png"
  },
  {
    "id": "vasa_patra",
    "name": "Vasa Patra (Leaves)",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/vasa_patra.png"
  },
  {
    "id": "godanti_raw",
    "name": "Godanti (Raw)",
    "type": "herb",
    "amount": 100,
    "iconName": "Sparkles",
    "image": "/assets/inventory/godanti_raw.png"
  },
  {
    "id": "shankha_raw",
    "name": "Shankha (Raw)",
    "type": "herb",
    "amount": 100,
    "iconName": "Sparkles",
    "image": "/assets/inventory/shankha_raw.png"
  },
  {
    "id": "varatika_raw",
    "name": "Varatika (Raw)",
    "type": "herb",
    "amount": 100,
    "iconName": "Sparkles",
    "image": "/assets/inventory/varatika_raw.png"
  },
  {
    "id": "guggulu_raw",
    "name": "Guggulu (Raw)",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/guggulu_raw.png"
  },
  {
    "id": "gandhaka_raw",
    "name": "Gandhaka (Raw)",
    "type": "herb",
    "amount": 100,
    "iconName": "Sparkles",
    "image": "/assets/inventory/gandhaka_raw.png"
  },
  {
    "id": "vanga_raw",
    "name": "Vanga (Raw)",
    "type": "herb",
    "amount": 100,
    "iconName": "Sparkles",
    "image": "/assets/inventory/vanga_raw.png"
  },
  {
    "id": "yashada_raw",
    "name": "Yashada (Raw)",
    "type": "herb",
    "amount": 100,
    "iconName": "Sparkles",
    "image": "/assets/inventory/yashada_raw.png"
  },
  {
    "id": "abhraka_raw",
    "name": "Abhraka (Raw)",
    "type": "herb",
    "amount": 100,
    "iconName": "Sparkles",
    "image": "/assets/inventory/abhraka_raw.png"
  },
  {
    "id": "tamra_raw",
    "name": "Tamra (Raw)",
    "type": "herb",
    "amount": 100,
    "iconName": "Sparkles",
    "image": "/assets/inventory/tamra_raw.png"
  },
  {
    "id": "tankana_raw",
    "name": "Tankana (Raw)",
    "type": "herb",
    "amount": 100,
    "iconName": "Sparkles",
    "image": "/assets/inventory/tankana_raw.png"
  },
  {
    "id": "kankshi_raw",
    "name": "Kankshi (Raw)",
    "type": "herb",
    "amount": 100,
    "iconName": "Sparkles",
    "image": "/assets/inventory/kankshi_raw.png"
  },
  {
    "id": "hingula_raw",
    "name": "Hingula (Raw)",
    "type": "herb",
    "amount": 100,
    "iconName": "Sparkles",
    "image": "/assets/inventory/hingula_raw.png"
  },
  {
    "id": "gairika_raw",
    "name": "Gairika (Raw)",
    "type": "herb",
    "amount": 100,
    "iconName": "Sparkles",
    "image": "/assets/inventory/gairika_raw.png"
  },
  {
    "id": "hingu_raw",
    "name": "Hingu (Raw)",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/hingu_raw.png"
  },
  {
    "id": "meshi_kshira",
    "name": "Goat Milk (Meshi Kshira)",
    "type": "liquid",
    "amount": 100,
    "iconName": "Droplet",
    "image": "/assets/inventory/meshi_kshira.png"
  },
  {
    "id": "kanjika",
    "name": "Sour gruel (Kanjika)",
    "type": "liquid",
    "amount": 100,
    "iconName": "Droplet",
    "image": "/assets/inventory/kanjika.png"
  },
  {
    "id": "hot_water",
    "name": "Hot water",
    "type": "liquid",
    "amount": 100,
    "iconName": "Droplet",
    "image": "/assets/inventory/hot_water.png"
  },
  {
    "id": "nirgundi_swarasa",
    "name": "Nirgundi swarasa",
    "type": "liquid",
    "amount": 100,
    "iconName": "Droplet",
    "image": "/assets/inventory/nirgundi_swarasa.png"
  },
  {
    "id": "mayur_pichha",
    "name": "Peacock feather (Mayur piccha)",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/mayur_pichha.png"
  },
  {
    "id": "vata_patra",
    "name": "Banyan Leaf (Vata patra)",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/vata_patra.png"
  },
  {
    "id": "multani_mitti",
    "name": "Multani Mitti (Clay)",
    "type": "herb",
    "amount": 100,
    "iconName": "Sparkles",
    "image": "/assets/inventory/multani_mitti.png"
  },
  {
    "id": "arjuna_twak",
    "name": "Arjuna twak (Bark)",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/arjuna_twak.png"
  },
  {
    "id": "rasona",
    "name": "Garlic (Rasona)",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/rasona.png"
  },
  {
    "id": "punarnava",
    "name": "Punarnava",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/punarnava.png"
  },
  {
    "id": "nimbatwak",
    "name": "Neem bark (Nimbatwak)",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/nimbatwak.png"
  },
  {
    "id": "kuturohini",
    "name": "Kuturohini",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/kuturohini.png"
  },
  {
    "id": "patolpatra",
    "name": "Patolpatra",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/patolpatra.png"
  },
  {
    "id": "rasna",
    "name": "Rasna",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/rasna.png"
  },
  {
    "id": "gokshura",
    "name": "Gokshura",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/gokshura.png"
  },
  {
    "id": "erandamula",
    "name": "Erandamula",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/erandamula.png"
  },
  {
    "id": "devadaru",
    "name": "Devadaru",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/devadaru.png"
  },
  {
    "id": "aragwadha",
    "name": "Aragwadha",
    "type": "herb",
    "amount": 100,
    "iconName": "Leaf",
    "image": "/assets/inventory/aragwadha.png"
  },
  {
    "id": "pycnometer",
    "name": "Pycnometer",
    "type": "utensil",
    "amount": 1,
    "iconName": "Sparkles",
    "image": "/assets/inventory/pycnometer.png"
  },
  {
    "id": "refractometer",
    "name": "Refractometer",
    "type": "utensil",
    "amount": 1,
    "iconName": "Sparkles",
    "image": "/assets/inventory/refractometer.png"
  },
  {
    "id": "ph_meter",
    "name": "pH Meter",
    "type": "utensil",
    "amount": 1,
    "iconName": "Sparkles",
    "image": "/assets/inventory/ph_meter.png"
  },
  {
    "id": "liquid_sample",
    "name": "Liquid Sample",
    "type": "liquid",
    "amount": 100,
    "iconName": "Droplet",
    "image": "/assets/inventory/liquid_sample.png"
  },
  {
    "id": "oil_sample",
    "name": "Oil Sample",
    "type": "liquid",
    "amount": 100,
    "iconName": "Droplet",
    "image": "/assets/inventory/oil_sample.png"
  },
  {
    "id": "solution_sample",
    "name": "Solution Sample",
    "type": "liquid",
    "amount": 100,
    "iconName": "Droplet",
    "image": "/assets/inventory/solution_sample.png"
  },
  {
    "id": "ki_paper",
    "name": "KI Reagent Paper",
    "type": "herb",
    "amount": 100,
    "iconName": "Sparkles",
    "image": "/assets/inventory/ki_paper.png"
  },
  {
    "id": "concentrated_hcl",
    "name": "Concentrated HCl",
    "type": "liquid",
    "amount": 100,
    "iconName": "Droplet",
    "image": "/assets/inventory/concentrated_hcl.png"
  },
  {
    "id": "abhraka_bhasma_sample",
    "name": "Abhraka Bhasma sample",
    "type": "herb",
    "amount": 100,
    "iconName": "Sparkles",
    "image": "/assets/inventory/abhraka_bhasma_sample.png"
  },
  {
    "id": "tamra_bhasma_sample",
    "name": "Tamra Bhasma sample",
    "type": "herb",
    "amount": 100,
    "iconName": "Sparkles",
    "image": "/assets/inventory/tamra_bhasma_sample.png"
  },
  {
    "id": "bhasma_sample",
    "name": "Bhasma sample",
    "type": "herb",
    "amount": 100,
    "iconName": "Sparkles",
    "image": "/assets/inventory/bhasma_sample.png"
  },
  {
    "id": "dadhi",
    "name": "Dadhi (Curd)",
    "type": "liquid",
    "amount": 100,
    "iconName": "Droplet",
    "image": "/assets/inventory/dadhi.png"
  }
];;

const defaultRecipes = [
  {
    "id": "agnitundi_vati",
    "finalForm": "pill",
    "name": "Agnitundi Vati",
    "simulationSteps": [
      {
        "action": "add",
        "item": "su_parada"
      },
      {
        "action": "add",
        "item": "su_vatsanabh"
      },
      {
        "action": "add",
        "item": "su_gandhaka"
      },
      {
        "action": "add",
        "item": "ajmoda"
      },
      {
        "action": "add",
        "item": "haritaki"
      },
      {
        "action": "add",
        "item": "bibhitaki"
      },
      {
        "action": "add",
        "item": "amalaki"
      },
      {
        "action": "add",
        "item": "svarji_kshara"
      },
      {
        "action": "add",
        "item": "yavakshara"
      },
      {
        "action": "add",
        "item": "chitraka"
      },
      {
        "action": "add",
        "item": "saindhava_lavana"
      },
      {
        "action": "add",
        "item": "shweta_jiraka"
      },
      {
        "action": "add",
        "item": "sauvarchal_lavana"
      },
      {
        "action": "add",
        "item": "vidanga"
      },
      {
        "action": "add",
        "item": "samudra_lavana"
      },
      {
        "action": "add",
        "item": "tankan_bhasma"
      },
      {
        "action": "add",
        "item": "su_vishamusti"
      },
      {
        "action": "grind"
      },
      {
        "action": "sieve"
      },
      {
        "action": "add",
        "item": "jambira_swarasa"
      },
      {
        "action": "mix"
      },
      {
        "action": "form_pills"
      }
    ],
    "successMessage": "✅ Agnitundi Vati prepared! Smooth brownish-black tablets ready."
  },
  {
    "id": "amruta_ghrita",
    "finalForm": "liquid",
    "name": "Amruta Ghrita",
    "simulationSteps": [
      {
        "action": "add",
        "item": "sunthi"
      },
      {
        "action": "grind"
      },
      {
        "action": "add",
        "item": "goghrita"
      },
      {
        "action": "add",
        "item": "amrita_kwatha"
      },
      {
        "action": "heat"
      },
      {
        "action": "filter"
      }
    ],
    "successMessage": "✅ Amruta Ghrita prepared!"
  },
  {
    "id": "ananda_bhairava_rasa",
    "finalForm": "pill",
    "name": "Ananda Bhairava Rasa",
    "simulationSteps": [
      {
        "action": "add",
        "item": "su_hingula"
      },
      {
        "action": "add",
        "item": "su_vatsanabha"
      },
      {
        "action": "add",
        "item": "sunthi"
      },
      {
        "action": "add",
        "item": "maricha"
      },
      {
        "action": "add",
        "item": "pippali"
      },
      {
        "action": "add",
        "item": "tankana"
      },
      {
        "action": "add",
        "item": "jatikosha"
      },
      {
        "action": "grind"
      },
      {
        "action": "add",
        "item": "jambira_swarasa"
      },
      {
        "action": "mix"
      },
      {
        "action": "form_pills"
      }
    ],
    "successMessage": "✅ Ananda Bhairava Rasa pills prepared!"
  },
  {
    "id": "arka_lavana",
    "finalForm": "powder",
    "name": "Arka Lavana",
    "simulationSteps": [
      {
        "action": "add",
        "item": "arka_patra"
      },
      {
        "action": "add",
        "item": "saindhava_lavana"
      },
      {
        "action": "heat"
      },
      {
        "action": "grind"
      }
    ],
    "successMessage": "✅ Arka Lavana prepared! Kajjali-colored ash salt ready."
  },
  {
    "id": "arka_taila",
    "finalForm": "liquid",
    "name": "Arka Taila",
    "simulationSteps": [
      {
        "action": "add",
        "item": "arkapatra_swarasa"
      },
      {
        "action": "add",
        "item": "haridra_kalka"
      },
      {
        "action": "add",
        "item": "sarshapa_taila"
      },
      {
        "action": "heat"
      },
      {
        "action": "filter"
      }
    ],
    "successMessage": "✅ Arka Taila prepared!"
  },
  {
    "id": "atasi_upanaha",
    "finalForm": "paste",
    "name": "Atasi Upanaha",
    "simulationSteps": [
      {
        "action": "add",
        "item": "atasi_beej"
      },
      {
        "action": "add",
        "item": "yava"
      },
      {
        "action": "add",
        "item": "godhuma"
      },
      {
        "action": "grind"
      },
      {
        "action": "add",
        "item": "gomutra"
      },
      {
        "action": "heat"
      },
      {
        "action": "add",
        "item": "haridra"
      },
      {
        "action": "add",
        "item": "saindhava_lavana"
      },
      {
        "action": "add",
        "item": "tila_taila"
      },
      {
        "action": "mix"
      }
    ],
    "successMessage": "✅ Atasi Upanaha prepared! Yellowish smooth paste ready."
  },
  {
    "id": "chandana_panaka",
    "finalForm": "liquid",
    "name": "Chandana Panaka",
    "simulationSteps": [
      {
        "action": "add",
        "item": "shweta_chandana_powder"
      },
      {
        "action": "add",
        "item": "water"
      },
      {
        "action": "filter"
      },
      {
        "action": "add",
        "item": "sharkara"
      },
      {
        "action": "add",
        "item": "jambira_rasa"
      },
      {
        "action": "mix"
      }
    ],
    "successMessage": "✅ Chandana Panaka prepared! Liquid drink ready."
  },
  {
    "id": "chandrodaya_varti",
    "finalForm": "pill",
    "name": "Chandrodaya Varti",
    "simulationSteps": [
      {
        "action": "add",
        "item": "shankhanabhi"
      },
      {
        "action": "add",
        "item": "bibhitaki"
      },
      {
        "action": "add",
        "item": "haritaki"
      },
      {
        "action": "add",
        "item": "manashila"
      },
      {
        "action": "add",
        "item": "pippali"
      },
      {
        "action": "add",
        "item": "maricha"
      },
      {
        "action": "add",
        "item": "kustha"
      },
      {
        "action": "add",
        "item": "vacha"
      },
      {
        "action": "grind"
      },
      {
        "action": "sieve"
      },
      {
        "action": "add",
        "item": "aja_dugdha"
      },
      {
        "action": "mix"
      },
      {
        "action": "form_pills"
      }
    ],
    "successMessage": "✅ Chandrodaya Varti prepared! Smooth brown eye-sticks ready."
  },
  {
    "id": "chincha_panaka",
    "finalForm": "liquid",
    "name": "Chincha Panaka",
    "simulationSteps": [
      {
        "action": "add",
        "item": "chincha_phal_majja"
      },
      {
        "action": "add",
        "item": "water"
      },
      {
        "action": "filter"
      },
      {
        "action": "add",
        "item": "sharkara"
      },
      {
        "action": "add",
        "item": "dhanyaka"
      },
      {
        "action": "add",
        "item": "ardraka"
      },
      {
        "action": "add",
        "item": "chaturjata"
      },
      {
        "action": "mix"
      }
    ],
    "successMessage": "✅ Chincha Panaka prepared! Liquid drink ready."
  },
  {
    "id": "chitrakadi_vati",
    "finalForm": "pill",
    "name": "Chitrakadi Vati",
    "simulationSteps": [
      {
        "action": "add",
        "item": "chitraka"
      },
      {
        "action": "add",
        "item": "pippalimula"
      },
      {
        "action": "add",
        "item": "yavakshara"
      },
      {
        "action": "add",
        "item": "sarji_kshara"
      },
      {
        "action": "add",
        "item": "saindhava_lavana"
      },
      {
        "action": "add",
        "item": "sauvarchal_lavana"
      },
      {
        "action": "add",
        "item": "vid_lavana"
      },
      {
        "action": "add",
        "item": "audbhida_lavana"
      },
      {
        "action": "add",
        "item": "samudra_lavana"
      },
      {
        "action": "add",
        "item": "sunthi"
      },
      {
        "action": "add",
        "item": "maricha"
      },
      {
        "action": "add",
        "item": "pippali"
      },
      {
        "action": "add",
        "item": "hingu"
      },
      {
        "action": "add",
        "item": "ajmoda"
      },
      {
        "action": "add",
        "item": "chavya"
      },
      {
        "action": "grind"
      },
      {
        "action": "sieve"
      },
      {
        "action": "add",
        "item": "matulunga_swarasa"
      },
      {
        "action": "mix"
      },
      {
        "action": "form_pills"
      }
    ],
    "successMessage": "✅ Chitrakadi Vati prepared! Brownish-black smooth tablets ready."
  },
  {
    "id": "dashanasamskara_churna",
    "finalForm": "powder",
    "name": "Dashanasamskara churna",
    "simulationSteps": [
      {
        "action": "add",
        "item": "sunthi"
      },
      {
        "action": "add",
        "item": "haritaki"
      },
      {
        "action": "add",
        "item": "musta"
      },
      {
        "action": "add",
        "item": "khadira_sara"
      },
      {
        "action": "add",
        "item": "puga_bhasma"
      },
      {
        "action": "add",
        "item": "maricha"
      },
      {
        "action": "add",
        "item": "lavanga"
      },
      {
        "action": "add",
        "item": "twak"
      },
      {
        "action": "add",
        "item": "khatika"
      },
      {
        "action": "grind"
      },
      {
        "action": "sieve"
      },
      {
        "action": "add",
        "item": "karpura"
      },
      {
        "action": "mix"
      }
    ],
    "successMessage": "✅ Dashanasamskara churna prepared! Whitish colored powder ready."
  },
  {
    "id": "dashanga_lepa",
    "finalForm": "paste",
    "name": "Dashanga Lepa",
    "simulationSteps": [
      {
        "action": "add",
        "item": "sirisha_twaka"
      },
      {
        "action": "add",
        "item": "madhuyasti"
      },
      {
        "action": "add",
        "item": "tagar"
      },
      {
        "action": "add",
        "item": "raktachandana"
      },
      {
        "action": "add",
        "item": "ela"
      },
      {
        "action": "add",
        "item": "jatamamsi"
      },
      {
        "action": "add",
        "item": "haridra"
      },
      {
        "action": "add",
        "item": "daruharidra"
      },
      {
        "action": "add",
        "item": "kustha"
      },
      {
        "action": "add",
        "item": "valaka"
      },
      {
        "action": "grind"
      },
      {
        "action": "add",
        "item": "ghrita"
      },
      {
        "action": "add",
        "item": "water"
      },
      {
        "action": "mix"
      }
    ],
    "successMessage": "✅ Dashanga Lepa prepared! Yellowish smooth paste ready."
  },
  {
    "id": "gandhaka_malahara",
    "finalForm": "paste",
    "name": "Gandhaka Malahara",
    "simulationSteps": [
      {
        "action": "add",
        "item": "su_gandhaka"
      },
      {
        "action": "add",
        "item": "girisindura"
      },
      {
        "action": "add",
        "item": "tankana"
      },
      {
        "action": "add",
        "item": "karpura"
      },
      {
        "action": "grind"
      },
      {
        "action": "add",
        "item": "siktha_taila"
      },
      {
        "action": "mix"
      }
    ],
    "successMessage": "✅ Gandhaka Malahara prepared! Brown smooth ointment ready."
  },
  {
    "id": "ghrita_murchana",
    "finalForm": "liquid",
    "name": "Ghrita Murchana",
    "simulationSteps": [
      {
        "action": "add",
        "item": "goghrita"
      },
      {
        "action": "heat"
      },
      {
        "action": "add",
        "item": "haritaki"
      },
      {
        "action": "add",
        "item": "bibhitaki"
      },
      {
        "action": "add",
        "item": "amalaki"
      },
      {
        "action": "add",
        "item": "musta"
      },
      {
        "action": "add",
        "item": "haridra"
      },
      {
        "action": "add",
        "item": "matulunga_swarasa"
      },
      {
        "action": "mix"
      },
      {
        "action": "add",
        "item": "water"
      },
      {
        "action": "heat"
      },
      {
        "action": "filter"
      }
    ],
    "successMessage": "✅ Murchhita Ghrita prepared!"
  },
  {
    "id": "guduchi_ghana",
    "finalForm": "powder",
    "name": "Guduchi Ghana",
    "simulationSteps": [
      {
        "action": "add",
        "item": "guduchi"
      },
      {
        "action": "add",
        "item": "water"
      },
      {
        "action": "heat"
      },
      {
        "action": "filter"
      },
      {
        "action": "heat"
      }
    ],
    "successMessage": "✅ Guduchi Ghana solid extracts prepared!"
  },
  {
    "id": "haridra_khanda",
    "finalForm": "powder",
    "name": "Haridra Khanda",
    "simulationSteps": [
      {
        "action": "add",
        "item": "haridra_kalka"
      },
      {
        "action": "add",
        "item": "goghrita"
      },
      {
        "action": "heat"
      },
      {
        "action": "add",
        "item": "godugdha"
      },
      {
        "action": "add",
        "item": "sita"
      },
      {
        "action": "heat"
      },
      {
        "action": "mix"
      },
      {
        "action": "add",
        "item": "trikatu"
      },
      {
        "action": "add",
        "item": "trijata"
      },
      {
        "action": "add",
        "item": "vidanga"
      },
      {
        "action": "add",
        "item": "trivritta"
      },
      {
        "action": "add",
        "item": "triphala"
      },
      {
        "action": "add",
        "item": "nagakeshara"
      },
      {
        "action": "add",
        "item": "musta"
      },
      {
        "action": "add",
        "item": "lauha_bhasma"
      },
      {
        "action": "mix"
      }
    ],
    "successMessage": "✅ Haridra Khanda granular paste prepared!"
  },
  {
    "id": "hingwastaka_churna",
    "finalForm": "powder",
    "name": "Hingwastaka Churna",
    "simulationSteps": [
      {
        "action": "add",
        "item": "sunthi"
      },
      {
        "action": "add",
        "item": "maricha"
      },
      {
        "action": "add",
        "item": "pippali"
      },
      {
        "action": "add",
        "item": "ajmoda"
      },
      {
        "action": "add",
        "item": "saindhava_lavana"
      },
      {
        "action": "add",
        "item": "shweta_jiraka"
      },
      {
        "action": "add",
        "item": "krishna_jiraka"
      },
      {
        "action": "grind"
      },
      {
        "action": "add",
        "item": "hingu"
      },
      {
        "action": "mix"
      }
    ],
    "successMessage": "✅ Hingwastaka Churna prepared! Blackish-brown aromatic powder ready."
  },
  {
    "id": "kaishora_guggulu",
    "finalForm": "pill",
    "name": "Kaishora Guggulu",
    "simulationSteps": [
      {
        "action": "add",
        "item": "haritaki"
      },
      {
        "action": "add",
        "item": "bibhitaki"
      },
      {
        "action": "add",
        "item": "amalaki"
      },
      {
        "action": "add",
        "item": "guduchi"
      },
      {
        "action": "add",
        "item": "water"
      },
      {
        "action": "heat"
      },
      {
        "action": "filter"
      },
      {
        "action": "add",
        "item": "guggulu"
      },
      {
        "action": "heat"
      },
      {
        "action": "add",
        "item": "triphala"
      },
      {
        "action": "add",
        "item": "trikatu"
      },
      {
        "action": "add",
        "item": "vidanga"
      },
      {
        "action": "mix"
      },
      {
        "action": "add",
        "item": "ghrita"
      },
      {
        "action": "form_pills"
      }
    ],
    "successMessage": "✅ Kaishora Guggulu prepared! Black smooth round tablets ready."
  },
  {
    "id": "kharjuradi_mantha",
    "finalForm": "liquid",
    "name": "Kharjuradi Mantha",
    "simulationSteps": [
      {
        "action": "add",
        "item": "kharjura_phala"
      },
      {
        "action": "add",
        "item": "dadima_beej"
      },
      {
        "action": "add",
        "item": "draksha"
      },
      {
        "action": "add",
        "item": "tintidika"
      },
      {
        "action": "add",
        "item": "chincha_phal_majja"
      },
      {
        "action": "add",
        "item": "amalaki"
      },
      {
        "action": "add",
        "item": "parushaka"
      },
      {
        "action": "add",
        "item": "water"
      },
      {
        "action": "mix"
      },
      {
        "action": "filter"
      }
    ],
    "successMessage": "✅ Kharjuradi Mantha prepared! Thick reddish-brown liquid ready."
  },
  {
    "id": "ksheerbala_taila",
    "finalForm": "liquid",
    "name": "Ksheerbala Taila",
    "simulationSteps": [
      {
        "action": "add",
        "item": "bala_kashaya"
      },
      {
        "action": "add",
        "item": "bala"
      },
      {
        "action": "add",
        "item": "tila_taila"
      },
      {
        "action": "add",
        "item": "godugdha"
      },
      {
        "action": "heat"
      },
      {
        "action": "filter"
      }
    ],
    "successMessage": "✅ Ksheerbala Taila prepared! Light brown medicated oil ready."
  },
  {
    "id": "kutaja_ghana",
    "finalForm": "pill",
    "name": "Kutaja Ghana",
    "simulationSteps": [
      {
        "action": "add",
        "item": "kutaja_twaka"
      },
      {
        "action": "add",
        "item": "water"
      },
      {
        "action": "heat"
      },
      {
        "action": "filter"
      },
      {
        "action": "heat"
      },
      {
        "action": "add",
        "item": "atisa_curna"
      },
      {
        "action": "mix"
      },
      {
        "action": "form_pills"
      }
    ],
    "successMessage": "✅ Kutaja Ghana pills prepared!"
  },
  {
    "id": "laghusutasekhara_rasa",
    "finalForm": "pill",
    "name": "Laghusutasekhara Rasa",
    "simulationSteps": [
      {
        "action": "add",
        "item": "su_gairika"
      },
      {
        "action": "add",
        "item": "sunthi"
      },
      {
        "action": "grind"
      },
      {
        "action": "add",
        "item": "tambul_patra_swarasa"
      },
      {
        "action": "mix"
      },
      {
        "action": "form_pills"
      }
    ],
    "successMessage": "✅ Laghusutasekhara Rasa pills prepared!"
  },
  {
    "id": "lavangadi_vati",
    "finalForm": "pill",
    "name": "Lavangadi Vati",
    "simulationSteps": [
      {
        "action": "add",
        "item": "lavanga"
      },
      {
        "action": "add",
        "item": "maricha"
      },
      {
        "action": "add",
        "item": "bibhitaki"
      },
      {
        "action": "add",
        "item": "khadir_sara"
      },
      {
        "action": "grind"
      },
      {
        "action": "sieve"
      },
      {
        "action": "add",
        "item": "babbul_kwatha"
      },
      {
        "action": "mix"
      },
      {
        "action": "form_pills"
      }
    ],
    "successMessage": "✅ Lavangadi Vati prepared! Smooth brownish tablets ready for chewing."
  },
  {
    "id": "mustadi_pramathya",
    "finalForm": "liquid",
    "name": "Mustadi Pramathya",
    "simulationSteps": [
      {
        "action": "add",
        "item": "musta"
      },
      {
        "action": "add",
        "item": "indrayava"
      },
      {
        "action": "mix"
      },
      {
        "action": "add",
        "item": "water"
      },
      {
        "action": "heat"
      },
      {
        "action": "filter"
      }
    ],
    "successMessage": "✅ Mustadi Pramathya prepared! Thick brown decoction ready."
  },
  {
    "id": "narikela_khanda",
    "finalForm": "powder",
    "name": "Narikela Khanda",
    "simulationSteps": [
      {
        "action": "add",
        "item": "coconut_powder"
      },
      {
        "action": "add",
        "item": "goghrita"
      },
      {
        "action": "heat"
      },
      {
        "action": "add",
        "item": "coconut_water"
      },
      {
        "action": "add",
        "item": "khanda_sita"
      },
      {
        "action": "heat"
      },
      {
        "action": "mix"
      },
      {
        "action": "add",
        "item": "dhanyaka"
      },
      {
        "action": "add",
        "item": "pippali"
      },
      {
        "action": "add",
        "item": "musta"
      },
      {
        "action": "add",
        "item": "vamshalochana"
      },
      {
        "action": "add",
        "item": "shweta_jiraka"
      },
      {
        "action": "add",
        "item": "krishna_jiraka"
      },
      {
        "action": "add",
        "item": "twak"
      },
      {
        "action": "add",
        "item": "ela"
      },
      {
        "action": "add",
        "item": "tejapatra"
      },
      {
        "action": "add",
        "item": "nagakeshar"
      },
      {
        "action": "mix"
      }
    ],
    "successMessage": "✅ Narikela Khanda granular paste prepared!"
  },
  {
    "id": "narikela_lavana",
    "finalForm": "powder",
    "name": "Narikela Lavana",
    "simulationSteps": [
      {
        "action": "add",
        "item": "ripened_coconut"
      },
      {
        "action": "add",
        "item": "saindhava_lavana"
      },
      {
        "action": "heat"
      },
      {
        "action": "grind"
      }
    ],
    "successMessage": "✅ Narikela Lavana prepared! Kajjali-colored coconut salt ready."
  },
  {
    "id": "navayas_lauha",
    "finalForm": "powder",
    "name": "Navayas Lauha",
    "simulationSteps": [
      {
        "action": "add",
        "item": "sunthi"
      },
      {
        "action": "add",
        "item": "maricha"
      },
      {
        "action": "add",
        "item": "pippali"
      },
      {
        "action": "add",
        "item": "amalaki"
      },
      {
        "action": "add",
        "item": "haritaki"
      },
      {
        "action": "add",
        "item": "bibhitaki"
      },
      {
        "action": "add",
        "item": "musta"
      },
      {
        "action": "add",
        "item": "vidanga"
      },
      {
        "action": "add",
        "item": "chitraka"
      },
      {
        "action": "grind"
      },
      {
        "action": "add",
        "item": "lauha_bhasma"
      },
      {
        "action": "mix"
      }
    ],
    "successMessage": "✅ Navayas Lauha homogenous powder prepared!"
  },
  {
    "id": "nimbu_sharkara",
    "finalForm": "liquid",
    "name": "Nimbu Sharkara",
    "simulationSteps": [
      {
        "action": "add",
        "item": "nimbu_swarasa"
      },
      {
        "action": "add",
        "item": "sharkara"
      },
      {
        "action": "heat"
      },
      {
        "action": "filter"
      }
    ],
    "successMessage": "✅ Nimbu Sharkara syrup prepared!"
  },
  {
    "id": "phalavarti",
    "finalForm": "pill",
    "name": "Phalavarti",
    "simulationSteps": [
      {
        "action": "add",
        "item": "madanaphala"
      },
      {
        "action": "add",
        "item": "pippali"
      },
      {
        "action": "add",
        "item": "kustha"
      },
      {
        "action": "add",
        "item": "vacha"
      },
      {
        "action": "add",
        "item": "sweta_sarshapa"
      },
      {
        "action": "add",
        "item": "yavakshara"
      },
      {
        "action": "grind"
      },
      {
        "action": "sieve"
      },
      {
        "action": "add",
        "item": "guda"
      },
      {
        "action": "add",
        "item": "water"
      },
      {
        "action": "heat"
      },
      {
        "action": "mix"
      },
      {
        "action": "form_pills"
      }
    ],
    "successMessage": "✅ Phalavarti prepared! Brownish elongated suppositories with tapering ends ready."
  },
  {
    "id": "rasa_parpati",
    "finalForm": "powder",
    "name": "Rasa Parpati",
    "simulationSteps": [
      {
        "action": "add",
        "item": "su_parada"
      },
      {
        "action": "add",
        "item": "su_gandhaka"
      },
      {
        "action": "grind"
      },
      {
        "action": "heat"
      },
      {
        "action": "mix"
      }
    ],
    "successMessage": "✅ Rasa Parpati flakes prepared!"
  },
  {
    "id": "saptamrita_lauha",
    "finalForm": "powder",
    "name": "Saptamrita Lauha",
    "simulationSteps": [
      {
        "action": "add",
        "item": "yastimadhu"
      },
      {
        "action": "add",
        "item": "haritaki"
      },
      {
        "action": "add",
        "item": "bibhitaki"
      },
      {
        "action": "add",
        "item": "amalaki"
      },
      {
        "action": "grind"
      },
      {
        "action": "add",
        "item": "lauha_bhasma"
      },
      {
        "action": "mix"
      }
    ],
    "successMessage": "✅ Saptamrita Lauha homogenous powder prepared!"
  },
  {
    "id": "shadanga_paneeya",
    "finalForm": "liquid",
    "name": "Shadanga Paneeya",
    "simulationSteps": [
      {
        "action": "add",
        "item": "musta"
      },
      {
        "action": "add",
        "item": "parpataka"
      },
      {
        "action": "add",
        "item": "usheer"
      },
      {
        "action": "add",
        "item": "chandana"
      },
      {
        "action": "add",
        "item": "rhibera"
      },
      {
        "action": "add",
        "item": "nagara"
      },
      {
        "action": "grind"
      },
      {
        "action": "add",
        "item": "water"
      },
      {
        "action": "heat"
      },
      {
        "action": "filter"
      }
    ],
    "successMessage": "✅ Shadanga Paneeya prepared! Brown decoction liquid ready."
  },
  {
    "id": "shweta_parpati",
    "finalForm": "powder",
    "name": "Shweta Parpati",
    "simulationSteps": [
      {
        "action": "add",
        "item": "soraka_kno3"
      },
      {
        "action": "add",
        "item": "sphatika_alum"
      },
      {
        "action": "add",
        "item": "navasadar_nh4cl"
      },
      {
        "action": "mix"
      },
      {
        "action": "heat"
      },
      {
        "action": "mix"
      }
    ],
    "successMessage": "✅ Shweta Parpati flakes prepared!"
  },
  {
    "id": "sitopaladi_churna",
    "finalForm": "powder",
    "name": "Sitopaladi Churna",
    "simulationSteps": [
      {
        "action": "add",
        "item": "sita"
      },
      {
        "action": "add",
        "item": "vamshalochana"
      },
      {
        "action": "add",
        "item": "pippali"
      },
      {
        "action": "add",
        "item": "ela"
      },
      {
        "action": "add",
        "item": "twak"
      },
      {
        "action": "grind"
      },
      {
        "action": "sieve"
      },
      {
        "action": "mix"
      }
    ],
    "successMessage": "✅ Sitopaladi Churna prepared! Fine homogeneous powder ready."
  },
  {
    "id": "taila_murchana",
    "finalForm": "liquid",
    "name": "Taila Murchana",
    "simulationSteps": [
      {
        "action": "add",
        "item": "tila_taila"
      },
      {
        "action": "heat"
      },
      {
        "action": "add",
        "item": "manjistha"
      },
      {
        "action": "add",
        "item": "haridra"
      },
      {
        "action": "add",
        "item": "lodhra"
      },
      {
        "action": "add",
        "item": "musta"
      },
      {
        "action": "add",
        "item": "hribera"
      },
      {
        "action": "add",
        "item": "haritaki"
      },
      {
        "action": "add",
        "item": "bibhitaki"
      },
      {
        "action": "add",
        "item": "amalaki"
      },
      {
        "action": "add",
        "item": "shuchipushpa"
      },
      {
        "action": "add",
        "item": "vatapraroha"
      },
      {
        "action": "add",
        "item": "nalika"
      },
      {
        "action": "add",
        "item": "water"
      },
      {
        "action": "mix"
      },
      {
        "action": "heat"
      },
      {
        "action": "filter"
      }
    ],
    "successMessage": "✅ Murchhita Taila prepared!"
  },
  {
    "id": "tribhuvan_kirti_rasa",
    "finalForm": "pill",
    "name": "Tribhuvan Kirti Rasa",
    "simulationSteps": [
      {
        "action": "add",
        "item": "su_hingula"
      },
      {
        "action": "add",
        "item": "su_vatsanabha"
      },
      {
        "action": "add",
        "item": "sunthi"
      },
      {
        "action": "add",
        "item": "maricha"
      },
      {
        "action": "add",
        "item": "pippali"
      },
      {
        "action": "add",
        "item": "tankana"
      },
      {
        "action": "add",
        "item": "pippalimula"
      },
      {
        "action": "grind"
      },
      {
        "action": "add",
        "item": "tulsi_swarasa"
      },
      {
        "action": "add",
        "item": "ardraka_swarasa"
      },
      {
        "action": "add",
        "item": "dhattura_patra_swarasa"
      },
      {
        "action": "add",
        "item": "nirgundi_swarasa"
      },
      {
        "action": "mix"
      },
      {
        "action": "form_pills"
      }
    ],
    "successMessage": "✅ Tribhuvan Kirti Rasa pills prepared!"
  },
  {
    "id": "triphala_ghrita",
    "finalForm": "liquid",
    "name": "Triphala Ghrita",
    "simulationSteps": [
      {
        "action": "add",
        "item": "haritaki"
      },
      {
        "action": "add",
        "item": "bibhitaki"
      },
      {
        "action": "add",
        "item": "amalaki"
      },
      {
        "action": "add",
        "item": "sunthi"
      },
      {
        "action": "add",
        "item": "maricha"
      },
      {
        "action": "add",
        "item": "pippali"
      },
      {
        "action": "add",
        "item": "draksha"
      },
      {
        "action": "add",
        "item": "yastimadhu"
      },
      {
        "action": "add",
        "item": "katurohini"
      },
      {
        "action": "add",
        "item": "prapaundarika"
      },
      {
        "action": "add",
        "item": "ela"
      },
      {
        "action": "add",
        "item": "vidanga"
      },
      {
        "action": "add",
        "item": "nagakeshara"
      },
      {
        "action": "add",
        "item": "nilotpala"
      },
      {
        "action": "add",
        "item": "sweta_sariva"
      },
      {
        "action": "add",
        "item": "krishna_sariva"
      },
      {
        "action": "add",
        "item": "shweta_chandana"
      },
      {
        "action": "add",
        "item": "haridra"
      },
      {
        "action": "add",
        "item": "daruharidra"
      },
      {
        "action": "mix"
      },
      {
        "action": "add",
        "item": "goghrita"
      },
      {
        "action": "add",
        "item": "godugdha"
      },
      {
        "action": "add",
        "item": "triphala_rasa"
      },
      {
        "action": "heat"
      },
      {
        "action": "filter"
      }
    ],
    "successMessage": "✅ Triphala Ghrita prepared!"
  },
  {
    "id": "triphala_guggulu",
    "finalForm": "pill",
    "name": "Triphala Guggulu",
    "simulationSteps": [
      {
        "action": "add",
        "item": "guggulu"
      },
      {
        "action": "add",
        "item": "water"
      },
      {
        "action": "heat"
      },
      {
        "action": "add",
        "item": "haritaki"
      },
      {
        "action": "add",
        "item": "bibhitaki"
      },
      {
        "action": "add",
        "item": "amalaki"
      },
      {
        "action": "add",
        "item": "pippali_churna"
      },
      {
        "action": "mix"
      },
      {
        "action": "add",
        "item": "ghrita"
      },
      {
        "action": "form_pills"
      }
    ],
    "successMessage": "✅ Triphala Guggulu prepared! Blackish smooth round tablets ready."
  },
  {
    "id": "vasavaleha",
    "finalForm": "paste",
    "name": "Vasavaleha",
    "simulationSteps": [
      {
        "action": "add",
        "item": "vasa_swarasa"
      },
      {
        "action": "add",
        "item": "sita"
      },
      {
        "action": "heat"
      },
      {
        "action": "add",
        "item": "pippali"
      },
      {
        "action": "add",
        "item": "ghrita"
      },
      {
        "action": "mix"
      },
      {
        "action": "add",
        "item": "madhu"
      },
      {
        "action": "mix"
      }
    ],
    "successMessage": "✅ Vasavaleha prepared! Greenish-brown smooth semi-solid Avaleha ready."
  },
  {
    "id": "godanti_shodhana",
    "finalForm": "powder",
    "name": "Godanti Shodhana",
    "simulationSteps": [
      { "action": "add", "item": "godanti_raw" },
      { "action": "grind" },
      { "action": "add", "item": "nimbu_swarasa" },
      { "action": "heat" },
      { "action": "filter" }
    ],
    "successMessage": "✅ Godanti Shodhana complete! Purified soft, dull white Godanti obtained."
  },
  {
    "id": "shankha_shodhana",
    "finalForm": "powder",
    "name": "Shankha Shodhana",
    "simulationSteps": [
      { "action": "add", "item": "shankha_raw" },
      { "action": "grind" },
      { "action": "add", "item": "kanjika" },
      { "action": "heat" },
      { "action": "add", "item": "hot_water" },
      { "action": "filter" }
    ],
    "successMessage": "✅ Shankha Shodhana complete! Clean and brittle Shankha pieces obtained."
  },
  {
    "id": "kapardika_shodhana",
    "finalForm": "powder",
    "name": "Kapardika Shodhana",
    "simulationSteps": [
      { "action": "add", "item": "varatika_raw" },
      { "action": "add", "item": "kanjika" },
      { "action": "heat" },
      { "action": "add", "item": "hot_water" },
      { "action": "filter" }
    ],
    "successMessage": "✅ Kapardika Shodhana complete! Brittle cowries obtained."
  },
  {
    "id": "guggulu_shodhana",
    "finalForm": "paste",
    "name": "Guggulu Shodhana",
    "simulationSteps": [
      { "action": "add", "item": "guggulu_raw" },
      { "action": "grind" },
      { "action": "add", "item": "triphala_kashaya" },
      { "action": "heat" },
      { "action": "filter" },
      { "action": "heat" }
    ],
    "successMessage": "✅ Guggulu Shodhana complete! Purified soft, waxy blackish-brown Guggulu obtained."
  },
  {
    "id": "gandhaka_shodhana",
    "finalForm": "powder",
    "name": "Gandhaka Shodhana",
    "simulationSteps": [
      { "action": "add", "item": "gandhaka_raw" },
      { "action": "grind" },
      { "action": "add", "item": "goghrita" },
      { "action": "heat" },
      { "action": "add", "item": "godugdha" },
      { "action": "filter" }
    ],
    "successMessage": "✅ Gandhaka Shodhana complete! Purified pale yellow Sulphur slab/powder obtained."
  },
  {
    "id": "vanga_shodhana",
    "finalForm": "powder",
    "name": "Vanga Shodhana",
    "simulationSteps": [
      { "action": "add", "item": "vanga_raw" },
      { "action": "heat" },
      { "action": "add", "item": "nirgundi_swarasa" },
      { "action": "add", "item": "haridra" },
      { "action": "filter" }
    ],
    "successMessage": "✅ Vanga Shodhana complete! Purified bright white solid Vanga obtained."
  },
  {
    "id": "yashada_shodhana",
    "finalForm": "powder",
    "name": "Yashada Shodhana",
    "simulationSteps": [
      { "action": "add", "item": "yashada_raw" },
      { "action": "heat" },
      { "action": "add", "item": "godugdha" },
      { "action": "filter" }
    ],
    "successMessage": "✅ Yashada Shodhana complete! Purified shiny bluish-white brittle metal obtained."
  },
  {
    "id": "abhraka_shodhana",
    "finalForm": "powder",
    "name": "Abhraka Shodhana",
    "simulationSteps": [
      { "action": "add", "item": "abhraka_raw" },
      { "action": "heat" },
      { "action": "add", "item": "triphala_rasa" },
      { "action": "filter" }
    ],
    "successMessage": "✅ Abhraka Shodhana complete! Purified brittle Abhraka obtained."
  },
  {
    "id": "tamra_shodhana",
    "finalForm": "powder",
    "name": "Tamra Shodhana",
    "simulationSteps": [
      { "action": "add", "item": "tamra_raw" },
      { "action": "add", "item": "saindhava_lavana" },
      { "action": "add", "item": "nimbu_swarasa" },
      { "action": "heat" },
      { "action": "add", "item": "kanjika" },
      { "action": "filter" }
    ],
    "successMessage": "✅ Tamra Shodhana complete! Purified blackish-red Tamra patra obtained."
  },
  {
    "id": "tankana_shodhana",
    "finalForm": "powder",
    "name": "Tankana Shodhana",
    "simulationSteps": [
      { "action": "add", "item": "tankana_raw" },
      { "action": "grind" },
      { "action": "heat" }
    ],
    "successMessage": "✅ Tankana Shodhana complete! White puffed flakes of purified Tankana obtained."
  },
  {
    "id": "kankshi_shodhana",
    "finalForm": "powder",
    "name": "Kankshi Shodhana",
    "simulationSteps": [
      { "action": "add", "item": "kankshi_raw" },
      { "action": "grind" },
      { "action": "heat" }
    ],
    "successMessage": "✅ Kankshi Shodhana complete! Purified light-weight white Alum crystals obtained."
  },
  {
    "id": "hingula_shodhana",
    "finalForm": "powder",
    "name": "Hingula Shodhana",
    "simulationSteps": [
      { "action": "add", "item": "hingula_raw" },
      { "action": "grind" },
      { "action": "add", "item": "meshi_kshira" },
      { "action": "add", "item": "nimbu_swarasa" },
      { "action": "mix" }
    ],
    "successMessage": "✅ Hingula Shodhana complete! Saffron-colored purified Hingula powder obtained."
  },
  {
    "id": "gairika_shodhana",
    "finalForm": "powder",
    "name": "Gairika Shodhana",
    "simulationSteps": [
      { "action": "add", "item": "gairika_raw" },
      { "action": "grind" },
      { "action": "add", "item": "goghrita" },
      { "action": "heat" }
    ],
    "successMessage": "✅ Gairika Shodhana complete! Purified brick-red Gairika powder obtained."
  },
  {
    "id": "hingu_shodhana",
    "finalForm": "powder",
    "name": "Hingu Shodhana",
    "simulationSteps": [
      { "action": "add", "item": "hingu_raw" },
      { "action": "grind" },
      { "action": "add", "item": "goghrita" },
      { "action": "heat" },
      { "action": "grind" }
    ],
    "successMessage": "✅ Hingu Shodhana complete! Purified aromatic reddish-brown Hingu obtained."
  },
  {
    "id": "mugdha_rasa",
    "finalForm": "powder",
    "name": "Mugdha Rasa",
    "simulationSteps": [
      { "action": "add", "item": "su_parada" },
      { "action": "add", "item": "khatika" },
      { "action": "grind" }
    ],
    "successMessage": "✅ Mugdha Rasa prepared! Grey powder without mercury shine is ready."
  },
  {
    "id": "bhasma_samanya_pariksha",
    "finalForm": "powder",
    "name": "Bhasma Samanya Pariksha",
    "simulationSteps": [
      { "action": "add", "item": "bhasma_sample" },
      { "action": "add", "item": "water" },
      { "action": "mix" }
    ],
    "successMessage": "✅ Bhasma Samanya Pariksha complete! Passed Varitara, Rekhapurnatvam, and Nischandra tests."
  },
  {
    "id": "tamra_bhasma_pariksha",
    "finalForm": "powder",
    "name": "Tamra Bhasma Dadhi/Nimbu Pariksha",
    "simulationSteps": [
      { "action": "add", "item": "tamra_bhasma_sample" },
      { "action": "add", "item": "dadhi" },
      { "action": "mix" }
    ],
    "successMessage": "✅ Tamra Bhasma Pariksha complete! No color change to blue, confirming good quality."
  },
  {
    "id": "npst_test",
    "finalForm": "powder",
    "name": "Namburi Phased Spot Test (NPST)",
    "simulationSteps": [
      { "action": "add", "item": "abhraka_bhasma_sample" },
      { "action": "add", "item": "concentrated_hcl" },
      { "action": "heat" },
      { "action": "filter" },
      { "action": "add", "item": "ki_paper" }
    ],
    "successMessage": "✅ Namburi Phased Spot Test complete! Color phases compared successfully."
  },
  {
    "id": "triphala_masi",
    "finalForm": "powder",
    "name": "Triphala Masi",
    "simulationSteps": [
      { "action": "add", "item": "haritaki" },
      { "action": "add", "item": "bibhitaki" },
      { "action": "add", "item": "amalaki" },
      { "action": "grind" },
      { "action": "heat" },
      { "action": "grind" }
    ],
    "successMessage": "✅ Triphala Masi prepared! Fine black powder (smooth like kajjali) ready."
  },
  {
    "id": "mayur_piccha_masi",
    "finalForm": "powder",
    "name": "Mayura Piccha Masi",
    "simulationSteps": [
      { "action": "add", "item": "mayur_pichha" },
      { "action": "heat" },
      { "action": "grind" }
    ],
    "successMessage": "✅ Mayura Piccha Masi prepared! Shiny black feather ash ready."
  },
  {
    "id": "vasaputapaka_swarasa",
    "finalForm": "liquid",
    "name": "Vasaputapaka Swarasa",
    "simulationSteps": [
      { "action": "add", "item": "vasa_patra" },
      { "action": "grind" },
      { "action": "add", "item": "vata_patra" },
      { "action": "add", "item": "multani_mitti" },
      { "action": "heat" },
      { "action": "filter" }
    ],
    "successMessage": "✅ Vasaputapaka Swarasa extracted! Concentrated greenish juice ready."
  },
  {
    "id": "amrita_satva",
    "finalForm": "powder",
    "name": "Amrita Satva",
    "simulationSteps": [
      { "action": "add", "item": "guduchi" },
      { "action": "grind" },
      { "action": "add", "item": "water" },
      { "action": "mix" },
      { "action": "filter" },
      { "action": "heat" }
    ],
    "successMessage": "✅ Amrita Satva prepared! Fine white starch powder obtained."
  },
  {
    "id": "arjuna_ksheera_paka",
    "finalForm": "liquid",
    "name": "Arjuna Ksheera Paka",
    "simulationSteps": [
      { "action": "add", "item": "arjuna_twak" },
      { "action": "grind" },
      { "action": "add", "item": "godugdha" },
      { "action": "add", "item": "water" },
      { "action": "heat" },
      { "action": "filter" }
    ],
    "successMessage": "✅ Arjuna Ksheerapaka prepared! Light brown medicated milk ready."
  },
  {
    "id": "rasona_ksheerapaka",
    "finalForm": "liquid",
    "name": "Rasona Ksheerapaka",
    "simulationSteps": [
      { "action": "add", "item": "rasona" },
      { "action": "grind" },
      { "action": "add", "item": "godugdha" },
      { "action": "add", "item": "water" },
      { "action": "heat" },
      { "action": "filter" }
    ],
    "successMessage": "✅ Rasona Ksheerapaka prepared! Garlicky medicated milk ready."
  },
  {
    "id": "punarnavastaka_kwatha",
    "finalForm": "liquid",
    "name": "Punarnavashtaka Kwatha",
    "simulationSteps": [
      { "action": "add", "item": "punarnava" },
      { "action": "add", "item": "haritaki" },
      { "action": "add", "item": "nimbatwak" },
      { "action": "add", "item": "daruharidra" },
      { "action": "add", "item": "kuturohini" },
      { "action": "add", "item": "patolpatra" },
      { "action": "add", "item": "guduchi" },
      { "action": "add", "item": "sunthi" },
      { "action": "grind" },
      { "action": "add", "item": "water" },
      { "action": "heat" },
      { "action": "filter" }
    ],
    "successMessage": "✅ Punarnavashtaka Kwatha prepared! Yellowish decoction ready."
  },
  {
    "id": "rasna_saptaka_kwatha",
    "finalForm": "liquid",
    "name": "Rasna Saptaka Kwatha",
    "simulationSteps": [
      { "action": "add", "item": "rasna" },
      { "action": "add", "item": "gokshura" },
      { "action": "add", "item": "erandamula" },
      { "action": "add", "item": "devadaru" },
      { "action": "add", "item": "punarnava" },
      { "action": "add", "item": "guduchi" },
      { "action": "add", "item": "aragwadha" },
      { "action": "grind" },
      { "action": "add", "item": "water" },
      { "action": "heat" },
      { "action": "filter" }
    ],
    "successMessage": "✅ Rasna Saptaka Kwatha prepared! Yellowish-brown decoction ready."
  },
  {
    "id": "specific_gravity",
    "finalForm": "liquid",
    "name": "Specific Gravity",
    "simulationSteps": [
      { "action": "add", "item": "liquid_sample" },
      { "action": "add", "item": "pycnometer" },
      { "action": "mix" },
      { "action": "heat" }
    ],
    "successMessage": "✅ Specific Gravity measured! Density parameter determined."
  },
  {
    "id": "refractive_index",
    "finalForm": "liquid",
    "name": "Refractive Index",
    "simulationSteps": [
      { "action": "add", "item": "oil_sample" },
      { "action": "add", "item": "refractometer" },
      { "action": "mix" }
    ],
    "successMessage": "✅ Refractive Index determined! Light refraction coefficient recorded."
  },
  {
    "id": "ph_determination",
    "finalForm": "liquid",
    "name": "pH Determination",
    "simulationSteps": [
      { "action": "add", "item": "solution_sample" },
      { "action": "add", "item": "ph_meter" },
      { "action": "mix" }
    ],
    "successMessage": "✅ pH Value determined! Acid-alkaline scale level successfully measured."
  }
];

export const DataProvider = ({ children }) => {
  // ── Cache migration: clear old data if version changed ─────────────────────
  const storedVersion = localStorage.getItem('ayurveda_data_version');
  if (storedVersion !== DATA_VERSION) {
    localStorage.removeItem('ayurveda_experiments');
    localStorage.removeItem('ayurveda_inventory');
    localStorage.removeItem('ayurveda_recipes');
    localStorage.setItem('ayurveda_data_version', DATA_VERSION);
  }

  const [experiments, setExperiments] = useState(() => {
    const saved = localStorage.getItem('ayurveda_experiments');
    const initial = saved ? JSON.parse(saved) : defaultExperiments;

    // Auto-patch: Ensure Sitopaladi Churna has the video URL even in old cached versions
                    return initial.map(exp => {
      if (exp.id === 1) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786380773/sitophaladi_churna_kqiek6.mp4" };
      }
      if (exp.id === 3) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786383637/agnitundi_vati_gpwakk.mp4" };
      }
      if (exp.id === 4) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786438783/chitrakari_vati_hpb1mf.mp4" };
      }
      if (exp.id === 6) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786438355/triphala_guggle_iukqhh.mp4" };
      }
      if (exp.id === 7) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786382481/kaishora_guggle_iiboe7.mp4" };
      }
      if (exp.id === 8) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786166262/phalavarti_l9jf2h.mp4" };
      }
      if (exp.id === 9) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786297249/chandrodaya_vati_ymedlv.mp4" };
      }
      if (exp.id === 10) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786439051/narikela_lavana_e8qifk.mp4" };
      }
      if (exp.id === 11) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786386255/Atasi_Upanaha_Preparation_Guide_720p_caption_hqpsqq.mp4" };
      }
      if (exp.id === 12) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786438963/Preparation_of_Dashanasamskara_Churna_720p_caption_kuqhyt.mp4" };
      }
      if (exp.id === 13) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786438540/Gandhaka_Malahara_Preparation_720p_caption_dvvj61.mp4" };
      }
      if (exp.id === 14) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786438965/Dashanga_Lepa_Preparation_720p_caption_1_mbnwu1.mp4" };
      }
      if (exp.id === 15) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786386194/Mustadi_Pramathya_Preparation_Guide_720p_caption_evcy2f.mp4" };
      }
      if (exp.id === 16) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786438955/Preparation_of_Shadanga_Paneeya_720p_caption_t8hx9s.mp4" };
      }
      if (exp.id === 17) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786438537/Kharjuradi_Mantha_Preparation_720p_caption_sd7v7g.mp4" };
      }
      if (exp.id === 18) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786439047/Chincha_Panaka_Preparation_1080p_caption_peguzv.mp4" };
      }
      if (exp.id === 19) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786386609/Preparation_of_Chandana_Panaka_%E0%A4%9A%E0%A4%A8%E0%A5%8D%E0%A4%A6%E0%A4%A8_%E0%A4%AA%E0%A4%BE%E0%A4%A8%E0%A4%95__720p_caption_rcecnk.mp4" };
      }
      if (exp.id === 20) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786438350/Preparation_of_Ghrita_Murchchhana_%E0%A4%98%E0%A5%83%E0%A4%A4_%E0%A4%AE%E0%A5%82%E0%A4%B0%E0%A5%8D%E0%A4%9A%E0%A5%8D%E0%A4%9B%E0%A4%A8%E0%A4%BE__720p_caption_m0t3tn.mp4" };
      }
      if (exp.id === 21) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786380740/tailamurchana_tw1feb.mp4" };
      }
      if (exp.id === 22) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786438617/Triphala_Ghrita__Ancient_Preparation_1080p_caption_zkadfb.mp4" };
      }
      if (exp.id === 23) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786296724/Amrita_Ghrita_Ayurvedic_Preparation_Guide_1080p_opkkki.mp4" };
      }
      if (exp.id === 24) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786382728/kasheerbaila_taila_dqcexy.mp4" };
      }
      if (exp.id === 25) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786386824/Preparation_of_Arka_Taila_%E0%A4%85%E0%A4%B0%E0%A5%8D%E0%A4%95_%E0%A4%A4%E0%A5%88%E0%A4%B2__720p_caption_hjwtt2.mp4" };
      }
      if (exp.id === 26) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786438464/vaasavaleha_syffc2.mp4" };
      }
      if (exp.id === 27) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786438627/Preparation_of_Nimbu_Sharkara_720p_caption_mtpjbw.mp4" };
      }
      if (exp.id === 28) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786439287/Preparation_of_Kutaja_Ghana_720p_caption_efb6lg.mp4" };
      }
      if (exp.id === 29) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786438603/Guduchi_Ghana_Preparation_1080p_caption_-_Copy_ezz3u1.mp4" };
      }
      if (exp.id === 30) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786438641/Haridra_Khanda_Preparation_1080p_caption_1_xshr84.mp4" };
      }
      if (exp.id === 31) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786454941/Preparation_of_Narikela_Khanda_1080p_caption_gkkpsn.mp4" };
      }
      if (exp.id === 32) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786386798/Preparation_of_Ananda_Bhairava_Rasa_1080p_caption_-_Copy_rpp9fw.mp4" };
      }
      if (exp.id === 33) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786380848/Tribhuvana_Kirti_Rasa_Preparation_1080p_caption_1_wykaax.mp4" };
      }
      if (exp.id === 34) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786442055/Preparation_of_Rasa_Parpati_1080p_caption_fbspzh.mp4" };
      }
      if (exp.id === 35) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786438577/Preparation_of_Shweta_Parpati_1080p_caption_cyut1m.mp4" };
      }
      if (exp.id === 36) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786442010/Preparation_of_Laghusutasekhara_Rasa_1080p_caption_-_Copy_vrfkma.mp4" };
      }
      if (exp.id === 37) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786442549/Navayas_Lauha_Preparation_Guide_1080p_caption_-_Copy_fphf22.mp4" };
      }
      if (exp.id === 38) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786442026/Preparation_of_Saptamrita_Lauha_1080p_caption_epo4ar.mp4" };
      }
      if (exp.id === 39) {
        return { ...exp, videoUrl: "https://res.cloudinary.com/npnav2np/video/upload/v1786297555/arka_lavana_nwoabf.mp4" };
      }
      return exp;
    });
  });

  const [inventoryItems, setInventoryItems] = useState(() => {
    const saved = localStorage.getItem('ayurveda_inventory');
    return saved ? JSON.parse(saved) : defaultInventoryItems;
  });

  const [recipes, setRecipes] = useState(() => {
    const saved = localStorage.getItem('ayurveda_recipes');
    return saved ? JSON.parse(saved) : defaultRecipes;
  });

  const [isLearningBlocked, setIsLearningBlocked] = useState(() => {
    const saved = localStorage.getItem('ayurveda_learning_blocked');
    return saved ? JSON.parse(saved) : false;
  });

  const [isExamMode, setIsExamMode] = useState(() => {
    const saved = localStorage.getItem('ayurveda_exam_mode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('ayurveda_experiments', JSON.stringify(experiments));
  }, [experiments]);

  useEffect(() => {
    localStorage.setItem('ayurveda_inventory', JSON.stringify(inventoryItems));
  }, [inventoryItems]);

  useEffect(() => {
    localStorage.setItem('ayurveda_recipes', JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem('ayurveda_learning_blocked', JSON.stringify(isLearningBlocked));
  }, [isLearningBlocked]);

  useEffect(() => {
    localStorage.setItem('ayurveda_exam_mode', JSON.stringify(isExamMode));
  }, [isExamMode]);

  const addExperiment = (newExp) => {
    setExperiments(prev => [...prev, { ...newExp, id: Date.now() }]);
  };

  const addInventoryItem = (newItem) => {
    setInventoryItems(prev => [...prev, { ...newItem, id: newItem.name.toLowerCase().replace(/\s+/g, '_') }]);
  };

  const addRecipe = (newRecipe) => {
    setRecipes(prev => [...prev, { ...newRecipe, id: newRecipe.name.toLowerCase().replace(/\s+/g, '_') }]);
  };

  const deleteExperiment = (id) => {
    setExperiments(prev => prev.filter(e => e.id !== id));
  };

  const deleteInventoryItem = (id) => {
    setInventoryItems(prev => prev.filter(i => i.id !== id));
  };

  const deleteRecipe = (id) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
  };

  return (
    <DataContext.Provider value={{
      experiments, addExperiment, deleteExperiment,
      inventoryItems, addInventoryItem, deleteInventoryItem,
      recipes, addRecipe, deleteRecipe,
      isLearningBlocked, setIsLearningBlocked,
      isExamMode, setIsExamMode
    }}>
      {children}
    </DataContext.Provider>
  );
};
