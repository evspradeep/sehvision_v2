import { SupportedLanguage, LanguageOption } from './types';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' }
];

export interface TranslationDictionary {
  appName: string;
  hospitalName: string;
  tagline: string;
  hello: string;
  letsCheckVision: string;
  listenToInstructions: string;
  listening: string;
  stopVoice: string;
  start: string;
  next: string;
  back: string;
  tryAgain: string;
  greatJob: string;
  wellDone: string;
  practiceTitle: string;
  practiceSubtitle: string;
  practiceSuccess: string;
  coverLeftEye: string;
  coverLeftEyeDesc: string;
  coverRightEye: string;
  coverRightEyeDesc: string;
  bothEyesOpen: string;
  bothEyesOpenDesc: string;
  gentleReminder: string;
  whichWayFacing: string;
  up: string;
  down: string;
  left: string;
  right: string;
  calibrationTitle: string;
  calibrationDesc: string;
  calibrationObject: string;
  calibrationPrompt: string;
  calibrationComplete: string;
  distanceTitle: string;
  distanceDesc: string;
  distancePrompt: string;
  colourVisionTitle: string;
  colourVisionDesc: string;
  colourVisionPrompt: string;
  cannotSeeAnything: string;
  testComplete: string;
  resultTitle: string;
  normalStatus: string;
  normalMessage: string;
  recheckStatus: string;
  recheckMessage: string;
  referralStatus: string;
  referralMessage: string;
  disclaimer: string;
  rightEyeAcuity: string;
  leftEyeAcuity: string;
  colourVisionAcuity: string;
  returnHome: string;
  askTeacher: string;
  offlineNotice: string;
  syncedNotice: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    appName: 'Sankara Digital Vision Screening',
    hospitalName: 'Sankara Eye Hospital',
    tagline: '',
    hello: '👋 Hello!',
    letsCheckVision: "Let's check your vision.",
    listenToInstructions: '🔊 Listen to instructions',
    listening: '🔊 Speaking...',
    stopVoice: '⏹️ Stop voice',
    start: 'START SCREENING',
    next: 'Next',
    back: 'Back',
    tryAgain: 'Almost! Try again! 🌟',
    greatJob: 'Super! That was correct! 🎉',
    wellDone: 'Well done! You are doing great.',
    practiceTitle: "Let's Practice!",
    practiceSubtitle: 'Look at the letter E. Which way are the open legs pointing?',
    practiceSuccess: "Awesome! You are ready for the real test.",
    coverLeftEye: '👁️ Cover your LEFT eye',
    coverLeftEyeDesc: 'Use your left hand or palm to gently cover your left eye. Do not press hard.',
    coverRightEye: '👁️ Cover your RIGHT eye',
    coverRightEyeDesc: 'Use your right hand or palm to gently cover your right eye. Do not press hard.',
    bothEyesOpen: '👀 Keep BOTH eyes open',
    bothEyesOpenDesc: 'Keep both eyes open and look directly at the center of the screen.',
    gentleReminder: 'Remember: Cup your palm gently over your eye. Please do not press on your eyeball.',
    whichWayFacing: 'Which way is the E facing?',
    up: 'Up',
    down: 'Down',
    left: 'Left',
    right: 'Right',
    calibrationTitle: 'Device Screen Calibration',
    calibrationDesc: 'Place a standard card (Sankara OP Card or ID card) next to the box below.',
    calibrationObject: 'Standard ID / OP Card (85.6 mm)',
    calibrationPrompt: 'Adjust until the screen box matches the physical card width exactly.',
    calibrationComplete: 'CALIBRATION CONFIRMED',
    distanceTitle: 'Screen Distance (3m / 10ft)',
    distanceDesc: 'Keep device at 3 meter / 10 feet distance from the eye.',
    distancePrompt: 'Position device exactly 3 metres (10 feet) away from the eye.',
    colourVisionTitle: 'Colour Vision Check',
    colourVisionDesc: 'Look at the colourful circle. What shape or number do you see inside?',
    colourVisionPrompt: 'Select the pattern you see in the dots:',
    cannotSeeAnything: 'I see only dots (nothing else)',
    testComplete: '🎉 Screening Complete!',
    resultTitle: 'Vision Screening Summary',
    normalStatus: '🟢 No Immediate Concern Detected',
    normalMessage: 'Your child\'s preliminary vision screening is within expected thresholds for their age.',
    recheckStatus: '🟡 Re-Check Recommended',
    recheckMessage: 'A screening re-check is advised in optimal room lighting to verify responses.',
    referralStatus: '🔴 Further Eye Examination Recommended',
    referralMessage: 'Please visit Sankara Eye Hospital or your nearest eye care centre for a full comprehensive eye examination.',
    disclaimer: 'Notice: This application is a digital screening aid, NOT a medical diagnosis. It does not replace a full examination by an eye specialist.',
    rightEyeAcuity: 'Right Eye Acuity',
    leftEyeAcuity: 'Left Eye Acuity',
    colourVisionAcuity: 'Colour Vision',
    returnHome: 'Finish Session',
    askTeacher: 'Need help? Ask your teacher or Sankara screening staff member.',
    offlineNotice: 'Saved offline. Will sync when connected.',
    syncedNotice: 'Securely recorded in hospital database.',
  },
  te: {
    appName: 'శంకర డిజిటల్ విజన్ స్క్రీనింగ్',
    hospitalName: 'శంకర కంటి ఆసుపత్రి',
    tagline: '',
    hello: '👋 నమస్కారం!',
    letsCheckVision: 'మీ కంటి చూపును పరీక్షిద్దాం.',
    listenToInstructions: '🔊 సూచనలు వినండి',
    listening: '🔊 వినిపిస్తోంది...',
    stopVoice: '⏹️ ఆపు',
    start: 'పరీక్ష ప్రారంభించండి',
    next: 'తరువాత',
    back: 'వెనుకకు',
    tryAgain: 'మరొక్కసారి ప్రయత్నించండి! 🌟',
    greatJob: 'చాలా బాగుంది! సరైన జవాబు! 🎉',
    wellDone: 'చక్కగా చేస్తున్నారు!',
    practiceTitle: 'ముందుగా సాధన చేద్దాం!',
    practiceSubtitle: 'ఈ E అక్షరం ఏ వైపు చూస్తుందో గుర్తించండి.',
    practiceSuccess: 'చాలా మంచిది! ఇప్పుడు అసలు పరీక్ష ప్రారంభిద్దాం.',
    coverLeftEye: '👁️ మీ ఎడమ కన్ను మూయండి',
    coverLeftEyeDesc: 'మీ ఎడమ చేతితో ఎడమ కన్నును సున్నితంగా మూయండి. కంటిపై గట్టిగా నొక్కవద్దు.',
    coverRightEye: '👁️ మీ కుడి కన్ను మూయండి',
    coverRightEyeDesc: 'మీ కుడి చేతితో కుడి కన్నును సున్నితంగా మూయండి. కంటిపై గట్టిగా నొక్కవద్దు.',
    bothEyesOpen: '👀 రెండు కళ్ళు తెరిచి ఉంచండి',
    bothEyesOpenDesc: 'రెండు కళ్ళు తెరిచి స్క్రీన్ వైపు చూడండి.',
    gentleReminder: 'గమనిక: కంటిపై గట్టిగా నొక్కకండి.',
    whichWayFacing: 'E ఏ దిశలో చూస్తోంది?',
    up: 'పైకి',
    down: 'క్రిందికి',
    left: 'ఎడమ',
    right: 'కుడి',
    calibrationTitle: 'స్క్రీన్ అమరిక (క్యాలిబ్రేషన్)',
    calibrationDesc: 'మీ సంకర OP కార్డ్ లేదా ఏదైనా ఐడీ కార్డును స్క్రీన్ దగ్గర ఉంచండి.',
    calibrationObject: 'స్టాండర్డ్ ఐడీ / OP కార్డ్ (85.6 mm)',
    calibrationPrompt: 'కార్డు పరిమాణానికి సరిపోయేలా బాక్స్ సర్దుబాటు చేయండి.',
    calibrationComplete: 'అమరిక పూర్తయింది',
    distanceTitle: 'స్క్రీన్ దూరం (3 మీ / 10 అడుగులు)',
    distanceDesc: 'పరికరాన్ని కంటికి 3 మీటర్లు / 10 అడుగుల దూరంలో ఉంచండి.',
    distancePrompt: 'పరికరాన్ని కంటికి సరిగ్గా 3 మీటర్ల (10 అడుగుల) దూరంలో ఉంచండి.',
    colourVisionTitle: 'రంగుల పరీక్ష',
    colourVisionDesc: 'చుక్కలలో ఉన్న ఆకారం లేదా సంఖ్యను గుర్తించండి.',
    colourVisionPrompt: 'మీకు కనిపించే ఆకారాన్ని ఎంచుకోండి:',
    cannotSeeAnything: 'నాకు ఏమీ కనిపించడం లేదు',
    testComplete: '🎉 పరీక్ష పూర్తయింది!',
    resultTitle: 'పరీక్ష ఫలితం',
    normalStatus: '🟢 ఎటువంటి సమస్య కనిపించలేదు',
    normalMessage: 'ప్రాథమిక పరీక్షలో మీ చూపు సాధారణంగా ఉంది.',
    recheckStatus: '🟡 పునఃపరిశీలన సిఫార్సు చేయబడింది',
    recheckMessage: 'మరొకసారి కంటి పరీక్ష చేయించడం మంచిది.',
    referralStatus: '🔴 పూర్తి కంటి పరీక్ష సిఫార్సు చేయబడింది',
    referralMessage: 'దయచేసి శంకర కంటి ఆసుపత్రిలో సమగ్ర కంటి పరీక్ష చేయించుకోండి.',
    disclaimer: 'గమనిక: ఇది ప్రాథమిక పరీక్ష మాత్రమే. ఇది డాక్టర్ పరీక్షకు ప్రత్యామ్నాయం కాదు.',
    rightEyeAcuity: 'కుడి కంటి చూపు',
    leftEyeAcuity: 'ఎడమ కంటి చూపు',
    colourVisionAcuity: 'రంగుల చూపు',
    returnHome: 'పూర్తి చేయండి',
    askTeacher: 'సహాయం కోసం మీ ఉపాధ్యాయుడిని అడగండి.',
    offlineNotice: 'ఆఫ్‌లైన్‌లో భద్రపరచబడింది.',
    syncedNotice: 'ఆసుపత్రి రికార్డులో భద్రపరచబడింది.',
  },
  hi: {
    appName: 'शंकरा डिजिटल दृष्टि जांच',
    hospitalName: 'शंकरा नेत्र चिकित्सालय',
    tagline: '',
    hello: '👋 नमस्ते!',
    letsCheckVision: 'आइए आपकी दृष्टि की जांच करें।',
    listenToInstructions: '🔊 निर्देश सुनें',
    listening: '🔊 बोल रहे हैं...',
    stopVoice: '⏹️ रोकें',
    start: 'जांच शुरू करें',
    next: 'आगे बढ़ें',
    back: 'पीछे',
    tryAgain: 'एक बार फिर कोशिश करें! 🌟',
    greatJob: 'शाबाश! बिल्कुल सही जवाब! 🎉',
    wellDone: 'बहुत अच्छा कर रहे हैं!',
    practiceTitle: 'आइए अभ्यास करें!',
    practiceSubtitle: 'E अक्षर किस तरफ खुला हुआ है?',
    practiceSuccess: 'बहुत बढ़िया! अब असली जांच शुरू करते हैं।',
    coverLeftEye: '👁️ अपनी बाईं आंख ढकें',
    coverLeftEyeDesc: 'हथेली से बाईं आंख को हल्के से ढकें। आंख पर दबाव न डालें।',
    coverRightEye: '👁️ अपनी दाईं आंख ढकें',
    coverRightEyeDesc: 'हथेली से दाईं आंख को हल्के से ढकें। आंख पर दबाव न डालें।',
    bothEyesOpen: '👀 दोनों आंखें खुली रखें',
    bothEyesOpenDesc: 'दोनों आंखें खुली रखें और स्क्रीन के बीच में देखें।',
    gentleReminder: 'याद रखें: आंख पर जोर से न दबाएं।',
    whichWayFacing: 'E किस दिशा में है?',
    up: 'ऊपर',
    down: 'नीचे',
    left: 'बाएं',
    right: 'दाएं',
    calibrationTitle: 'स्क्रीन कैलिब्रेशन',
    calibrationDesc: 'शंकरा OP कार्ड या आईडी कार्ड को स्क्रीन के पास रखें।',
    calibrationObject: 'आईडी कार्ड (85.6 mm)',
    calibrationPrompt: 'कार्ड के आकार के अनुसार बॉक्स को सेट करें।',
    calibrationComplete: 'कैलिब्रेशन पूरा हुआ',
    distanceTitle: 'स्क्रीन की दूरी (3 मी / 10 फीट)',
    distanceDesc: 'उपकरण को आंख से 3 मीटर / 10 फीट की दूरी पर रखें।',
    distancePrompt: 'उपकरण को आंख से ठीक 3 मीटर (10 फीट) की दूरी पर रखें।',
    colourVisionTitle: 'रंग दृष्टि जांच',
    colourVisionDesc: 'बिंदुओं के अंदर बनी आकृति या संख्या को पहचानें।',
    colourVisionPrompt: 'जो दिखाई दे उसे चुनें:',
    cannotSeeAnything: 'मुझे कुछ दिखाई नहीं दे रहा',
    testComplete: '🎉 जांच पूरी हुई!',
    resultTitle: 'दृष्टि जांच सारांश',
    normalStatus: '🟢 कोई समस्या नहीं पाई गई',
    normalMessage: 'प्रारंभिक जांच में दृष्टि सामान्य है।',
    recheckStatus: '🟡 पुनः जांच की सलाह',
    recheckMessage: 'एक बार फिर जांच कराने की सलाह दी जाती है।',
    referralStatus: '🔴 नेत्र विशेषज्ञ से जांच की सलाह',
    referralMessage: 'कृपया विस्तृत जांच के लिए शंकरा नेत्र अस्पताल जाएं।',
    disclaimer: 'सूचना: यह एक प्रारंभिक स्क्रीनिंग है, चिकित्सकीय निदान नहीं।',
    rightEyeAcuity: 'दाईं आंख की दृष्टि',
    leftEyeAcuity: 'बाईं आंख की दृष्टि',
    colourVisionAcuity: 'रंग पहचान',
    returnHome: 'समाप्त करें',
    askTeacher: 'मदद के लिए अपने शिक्षक से कहें।',
    offlineNotice: 'ऑफ़लाइन सुरक्षित किया गया।',
    syncedNotice: 'अस्पताल रिकॉर्ड में दर्ज हुआ।',
  },
  ta: {
    appName: 'சங்கரா டிஜிட்டல் பார்வை பரிசோதனை',
    hospitalName: 'சங்கரா கண் மருத்துவமனை',
    tagline: '',
    hello: '👋 வணக்கம்!',
    letsCheckVision: 'உங்கள் பார்வையை பரிசோதிப்போம்.',
    listenToInstructions: '🔊 வழிமுறைகளைக் கேளுங்கள்',
    listening: '🔊 கேட்கிறது...',
    stopVoice: '⏹️ நிறுத்து',
    start: 'பரிசோதனையைத் தொடங்குங்கள்',
    next: 'அடுத்து',
    back: 'பின்னால்',
    tryAgain: 'மீண்டும் முயற்சி செய்! 🌟',
    greatJob: 'அருமை! சரியான பதில்! 🎉',
    wellDone: 'மிக நன்று!',
    practiceTitle: 'பயிற்சி செய்வோம்!',
    practiceSubtitle: 'E எழுத்து எந்த திசையை நோக்கி உள்ளது?',
    practiceSuccess: 'சிறப்பு! இப்போது பரிசோதனையைத் தொடங்குவோம்.',
    coverLeftEye: '👁️ இடது கண்ணை மூடுங்கள்',
    coverLeftEyeDesc: 'இடது கையால் இடது கண்ணை மெதுவாக மூடுங்கள். அழுத்த வேண்டாம்.',
    coverRightEye: '👁️ வலது கண்ணை மூடுங்கள்',
    coverRightEyeDesc: 'வலது கையால் வலது கண்ணை மெதுவாக மூடுங்கள். அழுத்த வேண்டாம்.',
    bothEyesOpen: '👀 இரு கண்களையும் திறந்து வையுங்கள்',
    bothEyesOpenDesc: 'இரு கண்களையும் திறந்து திரையைப் பாருங்கள்.',
    gentleReminder: 'கவனிக்க: கண்ணை அழுத்த வேண்டாம்.',
    whichWayFacing: 'E எந்த திசையில் உள்ளது?',
    up: 'மேலே',
    down: 'கீழே',
    left: 'இடது',
    right: 'வலது',
    calibrationTitle: 'திரை அளவீடு (Calibration)',
    calibrationDesc: 'உங்கள் OP அட்டை அல்லது அடையாள அட்டையை திரையின் அருகில் வையுங்கள்.',
    calibrationObject: 'அடையாள அட்டை (85.6 mm)',
    calibrationPrompt: 'அட்டையின் அளவிற்கு ஏற்ப கட்டத்தை சரிசெய்யவும்.',
    calibrationComplete: 'அளவீடு முடிந்தது',
    distanceTitle: 'திரை தூரம் (3 மீ / 10 அடி)',
    distanceDesc: 'சாதனத்தை கண்ணிலிருந்து 3 மீட்டர் / 10 அடி தொலைவில் வைக்கவும்.',
    distancePrompt: 'சாதனத்தை கண்ணிலிருந்து சரியாக 3 மீட்டர் (10 அடி) தொலைவில் வைக்கவும்.',
    colourVisionTitle: 'வண்ண பார்வை பரிசோதனை',
    colourVisionDesc: 'புள்ளிகளுக்குள் இருக்கும் வடிவம் அல்லது எண்ணைக் கண்டறியவும்.',
    colourVisionPrompt: 'நீங்கள் பார்ப்பதைத் தேர்ந்தெடுக்கவும்:',
    cannotSeeAnything: 'எதுவும் தெரியவில்லை',
    testComplete: '🎉 பரிசோதனை முடிந்தது!',
    resultTitle: 'பரிசோதனை முடிவு',
    normalStatus: '🟢 எந்தப் பிரச்சனையும் காணப்படவில்லை',
    normalMessage: 'பார்வை சாதாரணமாக உள்ளது.',
    recheckStatus: '🟡 மறுபரிசீலனை பரிந்துரைக்கப்படுகிறது',
    recheckMessage: 'மீண்டும் ஒருமுறை சோதிக்க பரிந்துரைக்கப்படுகிறது.',
    referralStatus: '🔴 விரிவான கண் பரிசோதனை தேவை',
    referralMessage: 'சங்கரா கண் மருத்துவமனையில் முழு கண் பரிசோதனை செய்து கொள்ளவும்.',
    disclaimer: 'குறிப்பு: இது ஒரு ஆரம்பக்கட்ட பரிசோதனை மட்டுமே.',
    rightEyeAcuity: 'வலது கண் பார்வை',
    leftEyeAcuity: 'இடது கண் பார்வை',
    colourVisionAcuity: 'வண்ண பார்வை',
    returnHome: 'முடி',
    askTeacher: 'உதவிக்கு ஆசிரியரிடம் கேட்கவும்.',
    offlineNotice: 'ஆஃப்லைனில் சேமிக்கப்பட்டது.',
    syncedNotice: 'மருத்துவமனை பதிவேட்டில் சேர்க்கப்பட்டது.',
  },
  kn: {
    appName: 'ಶಂಕರ ಡಿಜಿಟಲ್ ದೃಷ್ಟಿ ತಪಾಸಣೆ',
    hospitalName: 'ಶಂಕರ ಕಣ್ಣಿನ ಆಸ್ಪತ್ರೆ',
    tagline: '',
    hello: '👋 ನಮಸ್ಕಾರ!',
    letsCheckVision: 'ನಿಮ್ಮ ದೃಷ್ಟಿಯನ್ನು ಪರೀಕ್ಷಿಸೋಣ.',
    listenToInstructions: '🔊 ಸೂಚನೆಗಳನ್ನು ಆಲಿಸಿ',
    listening: '🔊 ಆಲಿಸುತ್ತಿದೆ...',
    stopVoice: '⏹️ ನಿಲ್ಲಿಸು',
    start: 'ತಪಾಸಣೆ ಪ್ರಾರಂಭಿಸಿ',
    next: 'ಮುಂದೆ',
    back: 'ಹಿಂದೆ',
    tryAgain: 'ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ! 🌟',
    greatJob: 'ಅತ್ಯುತ್ತಮ! ಸರಿಯಾದ ಉತ್ತರ! 🎉',
    wellDone: 'ತುಂಬಾ ಚೆನ್ನಾಗಿ ಮಾಡುತ್ತಿದ್ದೀರಿ!',
    practiceTitle: 'ಅಭ್ಯಾಸ ಮಾಡೋಣ!',
    practiceSubtitle: 'E ಅಕ್ಷರವು ಯಾವ ದಿಕ್ಕಿಗೆ ಮುಖ ಮಾಡಿದೆ?',
    practiceSuccess: 'ಉತ್ತಮ! ಈಗ ನಿಜವಾದ ಪರೀಕ್ಷೆ ಪ್ರಾರಂಭಿಸೋಣ.',
    coverLeftEye: '👁️ ನಿಮ್ಮ ಎಡಗಣ್ಣನ್ನು ಮುಚ್ಚಿ',
    coverLeftEyeDesc: 'ಎಡಗೈಯಿಂದ ಎಡಗಣ್ಣನ್ನು ಮೃದುವಾಗಿ ಮುಚ್ಚಿ. ಕಣ್ಣನ್ನು ಒತ್ತಬೇಡಿ.',
    coverRightEye: '👁️ ನಿಮ್ಮ ಬಲಗಣ್ಣನ್ನು ಮುಚ್ಚಿ',
    coverRightEyeDesc: 'ಬಲಗೈಯಿಂದ ಬಲಗಣ್ಣನ್ನು ಮೃದುವಾಗಿ ಮುಚ್ಚಿ. ಕಣ್ಣನ್ನು ಒತ್ತಬೇಡಿ.',
    bothEyesOpen: '👀 ಎರಡೂ ಕಣ್ಣುಗಳನ್ನು ತೆರೆದಿಡಿ',
    bothEyesOpenDesc: 'ಎರಡೂ ಕಣ್ಣುಗಳನ್ನು ತೆರೆದು ಪರದೆಯನ್ನು ನೋಡಿ.',
    gentleReminder: 'ಗಮನಿಸಿ: ಕಣ್ಣಿನ ಮೇಲೆ ಒತ್ತಡ ಹಾಕಬೇಡಿ.',
    whichWayFacing: 'E ಯಾವ ದಿಕ್ಕಿನಲ್ಲಿದೆ?',
    up: 'ಮೇಲೆ',
    down: 'ಕೆಳಗೆ',
    left: 'ಎಡ',
    right: 'ಬಲ',
    calibrationTitle: 'ಪರದೆಯ ಅಳತೆ (Calibration)',
    calibrationDesc: 'ನಿಮ್ಮ OP ಕಾರ್ಡ್ ಅಥವಾ ಗುರುತಿನ ಚೀಟಿಯನ್ನು ಪರದೆಯ ಹತ್ತಿರ ಇರಿಸಿ.',
    calibrationObject: 'ಗುರುತಿನ ಚೀಟಿ (85.6 mm)',
    calibrationPrompt: 'ಕಾರ್ಡಿನ ಅಳತೆಗೆ ಸರಿಯಾಗಿ ಹೊಂದಿಸಿ.',
    calibrationComplete: 'ಅಳತೆ ಪೂರ್ಣಗೊಂಡಿದೆ',
    distanceTitle: 'ಪರದೆಯ ದೂರ (3 ಮೀ / 10 ಅಡಿ)',
    distanceDesc: 'ಸಾಧನವನ್ನು ಕಣ್ಣಿನಿಂದ 3 ಮೀಟರ್ / 10 ಅಡಿ ದೂರದಲ್ಲಿ ಇರಿಸಿ.',
    distancePrompt: 'ಸಾಧನವನ್ನು ಕಣ್ಣಿನಿಂದ ನಿಖರವಾಗಿ 3 ಮೀಟರ್ (10 ಅಡಿ) ದೂರದಲ್ಲಿ ಇರಿಸಿ.',
    colourVisionTitle: 'ಬಣ್ಣ ದೃಷ್ಟಿ ತಪಾಸಣೆ',
    colourVisionDesc: 'ಚುಕ್ಕೆಗಳಲ್ಲಿರುವ ಆಕಾರ ಅಥವಾ ಸಂಖ್ಯೆಯನ್ನು ಗುರುತಿಸಿ.',
    colourVisionPrompt: 'ಕಾಣುವ ಆಕಾರವನ್ನು ಆರಿಸಿ:',
    cannotSeeAnything: 'ನನಗೆ ಏನೂ ಕಾಣಿಸುತ್ತಿಲ್ಲ',
    testComplete: '🎉 ತಪಾಸಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ!',
    resultTitle: 'ದೃಷ್ಟಿ ತಪಾಸಣೆ ಫಲಿತಾಂಶ',
    normalStatus: '🟢 ಯಾವುದೇ ತೊಂದರೆ ಕಂಡುಬಂದಿಲ್ಲ',
    normalMessage: 'ಪ್ರಾಥಮಿಕ ತಪಾಸಣೆಯಲ್ಲಿ ದೃಷ್ಟಿ ಸಾಮಾನ್ಯವಾಗಿದೆ.',
    recheckStatus: '🟡 ಮರುಪರೀಕ್ಷೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ',
    recheckMessage: 'ಮತ್ತೊಮ್ಮೆ ಪರೀಕ್ಷಿಸಲು ಸೂಚಿಸಲಾಗಿದೆ.',
    referralStatus: '🔴 ನೇತ್ರ ತಜ್ಞರಿಂದ ತಪಾಸಣೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ',
    referralMessage: 'ದಯವಿಟ್ಟು ಶಂಕರ ಕಣ್ಣಿನ ಆಸ್ಪತ್ರೆಯಲ್ಲಿ ಪೂರ್ಣ ತಪಾಸಣೆ ಮಾಡಿಸಿಕೊಳ್ಳಿ.',
    disclaimer: 'ಸೂಚನೆ: ಇದು ಕೇವಲ ಪ್ರಾಥಮಿಕ ಸ್ಕ್ರೀನಿಂಗ್ ಆಗಿದೆ.',
    rightEyeAcuity: 'ಬಲಗಣ್ಣಿನ ದೃಷ್ಟಿ',
    leftEyeAcuity: 'ಎಡಗಣ್ಣಿನ ದೃಷ್ಟಿ',
    colourVisionAcuity: 'ಬಣ್ಣ ಗ್ರಹಿಕೆ',
    returnHome: 'ಮುಗಿಸಿ',
    askTeacher: 'ಸಹಾಯಕ್ಕಾಗಿ ಶಿಕ್ಷಕರನ್ನು ಕೇಳಿ.',
    offlineNotice: 'ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ.',
    syncedNotice: 'ಆಸ್ಪತ್ರೆಯ ದಾಖಲೆಯಲ್ಲಿ ಸೇರಿಸಲಾಗಿದೆ.',
  }
};
