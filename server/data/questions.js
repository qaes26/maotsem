// Database of Questions, Lineup Matches, Football Auctions, Goal Sketches, Commentary Clues, and Charades for "حخلص عليك"
// Comprehensive, verified Arabic content for all rounds and tournament modes

import { generateMathQuestion, generateArabicRootQuestion } from './questionGenerator.js';

export function getQuestions() {
  const baseQuestions = [
    // ==========================================
    // 1. الدوري الإنجليزي (Premier League & Top 6)
    // ==========================================
    {
      id: 'epl-1',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'premier-league',
      subcategoryName: 'الدوري الإنجليزي',
      question: 'أي نادٍ حقق لقب الدوري الإنجليزي الممتاز التاريخي عام 2016 بقيادة كلاوديو رانييري؟',
      options: ['ليستر سيتي', 'توتنهام', 'إيفرتون', 'وست هام'],
      correctAnswer: 0,
      points: 200,
      difficulty: 'easy',
      explanation: 'ليستر سيتي فجر أكبر مفاجأة في تاريخ البريميرليغ بحصد اللقب في موسم 2015-2016.'
    },
    {
      id: 'epl-2',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'premier-league',
      subcategoryName: 'الدوري الإنجليزي',
      question: 'من هو الهداف التاريخي للدوري الإنجليزي الممتاز برصيد 260 هدفاً؟',
      options: ['واين روني', 'آلان شيرار', 'هاري كين', 'سيرجيو أجويرو'],
      correctAnswer: 1,
      points: 200,
      difficulty: 'easy',
      explanation: 'آلان شيرار يتربع على قمة الهدافين التاريخيين للبريميرليغ برصيد 260 هدفاً.'
    },
    {
      id: 'epl-3',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'premier-league',
      subcategoryName: 'الدوري الإنجليزي',
      question: 'كم عدد أهداف إيرلينغ هالاند في أول موسم له في البريميرليغ (2022-2023) محطماً الرقم القياسي؟',
      options: ['34 هدفاً', '36 هدفاً', '38 هدفاً', '32 هدفاً'],
      correctAnswer: 1,
      points: 400,
      difficulty: 'medium',
      explanation: 'سجل هالاند 36 هدفاً في 35 مباراة محطماً الرقم القياسي التاريخي للمسابقة.'
    },
    {
      id: 'epl-4',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'premier-league',
      subcategoryName: 'الدوري الإنجليزي',
      question: 'في أي دقيقة سجل سيرجيو أجويرو هدفه الأيقوني الشهير الذي منح مانشستر سيتي لقب 2012؟',
      options: ['93:20', '91:45', '94:10', '92:30'],
      correctAnswer: 0,
      points: 600,
      difficulty: 'hard',
      explanation: 'الهدف سُجل في الدقيقة 93:20 ضد كوينز بارك رينجرز واشتهر بصرخة الشوالي "أغويرووووو".'
    },
    {
      id: 'epl-5',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'premier-league',
      subcategoryName: 'الدوري الإنجليزي',
      question: 'ما هو النادي الوحيد الذي أنهى موسماً كاملاً في البريميرليغ دون أي هزيمة (دوري الذهب)؟',
      options: ['مانشستر يونايتد', 'أرسنال', 'تشيلسي', 'ليفربول'],
      correctAnswer: 1,
      points: 200,
      difficulty: 'easy',
      explanation: 'أرسنال في موسم 2003-2004 حقق اللقب التاريخي الذهبي دون خسارة (Invincibles).'
    },
    {
      id: 'epl-6',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'premier-league',
      subcategoryName: 'الدوري الإنجليزي',
      question: 'من هو الحارس الذي يحمل الرقم القياسي لأكثر عدد من الشباك النظيفة (Clean Sheets) في تاريخ البريميرليغ؟',
      options: ['بيتر تشيك', 'دافيد دي خيا', 'بيتر شمايكل', 'إدوين فان دير سار'],
      correctAnswer: 0,
      points: 400,
      difficulty: 'medium',
      explanation: 'بيتر تشيك حقق 202 مباراة بشباك نظيفة في البريميرليغ مع تشيلسي وأرسنال.'
    },
    {
      id: 'epl-7',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'premier-league',
      subcategoryName: 'الدوري الإنجليزي',
      question: 'كم عدد ألقاب الدوري الإنجليزي الممتاز التي حققها السير أليكس فيرغسون مع مانشستر يونايتد؟',
      options: ['11 لقباً', '13 لقباً', '15 لقباً', '10 ألقاب'],
      correctAnswer: 1,
      points: 600,
      difficulty: 'hard',
      explanation: 'قاد السير أليكس فيرغسون اليونايتد لـ 13 لقباً في البريميرليغ خلال 26 عاماً.'
    },
    {
      id: 'epl-8',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'premier-league',
      subcategoryName: 'الدوري الإنجليزي',
      question: 'أي لاعب يحمل الرقم القياسي لأسرع ثلاثية (هاتريك) في تاريخ البريميرليغ (دقيقتان و56 ثانية)؟',
      options: ['ساديو ماني', 'روبي فاولر', 'سيرجيو أجويرو', 'مايكل أوين'],
      correctAnswer: 0,
      points: 600,
      difficulty: 'hard',
      explanation: 'ساديو ماني سجل أسرع هاتريك في دقيقتين و56 ثانية مع ساوثهامبتون ضد أستون فيلا عام 2015.'
    },

    // ==========================================
    // 2. الدوري الإسباني (La Liga) & الكلاسيكو
    // ==========================================
    {
      id: 'laliga-1',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'la-liga',
      subcategoryName: 'الدوري الإسباني',
      question: 'من هو الهداف التاريخي للدوري الإسباني (La Liga) على مر العصور؟',
      options: ['كريستيانو رونالدو', 'ليونيل ميسي', 'تيلمو زارا', 'ألفريدو دي ستيفانو'],
      correctAnswer: 1,
      points: 200,
      difficulty: 'easy',
      explanation: 'ليونيل ميسي هو الهداف التاريخي لليغا بـ 474 هدفاً مع نادي برشلونة.'
    },
    {
      id: 'laliga-2',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'la-liga',
      subcategoryName: 'الدوري الإسباني',
      question: 'ما هو النادي الملقب بـ "الغواصات الصفراء" في الدوري الإسباني؟',
      options: ['فياريال', 'قادش', 'لاس بالماس', 'سيلتا فيغو'],
      correctAnswer: 0,
      points: 200,
      difficulty: 'easy',
      explanation: 'نادي فياريال يُعرف بلقب الغواصات الصفراء (El Submarino Amarillo).'
    },
    {
      id: 'laliga-3',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'la-liga',
      subcategoryName: 'الدوري الإسباني',
      question: 'أي فريق كسر هيمنة ريال مدريد وبرشلونة وتوج بلقب الليغا في موسم 2013-2014 برأسية غودين؟',
      options: ['إشبيلية', 'أتلتيكو مدريد', 'فالنسيا', 'ريال سوسيداد'],
      correctAnswer: 1,
      points: 400,
      difficulty: 'medium',
      explanation: 'أتلتيكو مدريد بقيادة سيميوني توج باللقب في الكامب نو بتعادل 1-1 في الجولة الأخيرة.'
    },
    {
      id: 'laliga-4',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'clasico',
      subcategoryName: 'الكلاسيكو',
      question: 'من هو الهداف التاريخي لمباريات الكلاسيكو بين ريال مدريد وبرشلونة برصيد 26 هدفاً؟',
      options: ['كريستيانو رونالدو', 'ألفريدو دي ستيفانو', 'ليونيل ميسي', 'راؤول غونزاليس'],
      correctAnswer: 2,
      points: 200,
      difficulty: 'easy',
      explanation: 'ليونيل ميسي سجل 26 هدفاً في الكلاسيكو وهو الرقم القياسي المطلق.'
    },
    {
      id: 'laliga-5',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'clasico',
      subcategoryName: 'الكلاسيكو',
      question: 'في أي عام فاز برشلونة على ريال مدريد بنتيجة 6-2 التاريخية في ملعب سانتياغو برنابيو؟',
      options: ['2008', '2009', '2010', '2011'],
      correctAnswer: 1,
      points: 400,
      difficulty: 'medium',
      explanation: 'المباراة أقيمت في 2 مايو 2009 وشهدت توهج ميسي وهنري في أول مواسم بيب غوارديولا.'
    },
    {
      id: 'laliga-6',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'clasico',
      subcategoryName: 'الكلاسيكو',
      question: 'من سجل هدف الفوز برأسية قاتلة لريال مدريد في نهائي كأس الملك 2011 ضد برشلونة في الشوط الإضافي؟',
      options: ['كريستيانو رونالدو', 'سيرجيو راموس', 'كريم بنزيما', 'أنخيل دي ماريا'],
      correctAnswer: 0,
      points: 400,
      difficulty: 'medium',
      explanation: 'كريستيانو رونالدو سجل رأسية تاريخية بعد عرضية دي ماريا ليمنح مورينيو أول ألقابه في المستايا.'
    },

    // ==========================================
    // 3. دوري أبطال أوروبا (Champions League)
    // ==========================================
    {
      id: 'ucl-1',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'champions-league',
      subcategoryName: 'دوري أبطال أوروبا',
      question: 'كم مرة توج نادي ريال مدريد بلقب دوري أبطال أوروبا عبر تاريخه (حتى 2024)؟',
      options: ['13 مرة', '14 مرة', '15 مرة', '16 مرة'],
      correctAnswer: 2,
      points: 200,
      difficulty: 'easy',
      explanation: 'حقق ريال مدريد لقبه الـ15 التاريخي في ويمبلي بعد الفوز على بوروسيا دورتموند 2024.'
    },
    {
      id: 'ucl-2',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'champions-league',
      subcategoryName: 'دوري أبطال أوروبا',
      question: 'من سجل هدف الفوز المقصي الخرافي لريال مدريد في نهائي دوري الأبطال 2018 ضد ليفربول؟',
      options: ['كريستيانو رونالدو', 'غاريث بيل', 'كريم بنزيما', 'سيرجيو راموس'],
      correctAnswer: 1,
      points: 400,
      difficulty: 'medium',
      explanation: 'غاريث بيل سجل مقصية مزدوجة مذهلة في كييف بعد نزوله كبديل.'
    },
    {
      id: 'ucl-3',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'champions-league',
      subcategoryName: 'دوري أبطال أوروبا',
      question: 'في نهائي إسطنبول التاريخي 2005، قلب ليفربول تأخره أمام ميلان من 0-3 إلى التعادل، من كان قائد ليفربول؟',
      options: ['ستيفن جيرارد', 'جيمي كاراغر', 'تشابي ألونسو', 'سامي هيبيا'],
      correctAnswer: 0,
      points: 200,
      difficulty: 'easy',
      explanation: 'ستيفن جيرارد قاد العودة التاريخية برأسية الهدف الأول وحصل على ركلة الجزاء.'
    },
    {
      id: 'ucl-4',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'champions-league',
      subcategoryName: 'دوري أبطال أوروبا',
      question: 'من هو المدرب الوحيد الذي فاز بدوري أبطال أوروبا 3 مرات متتالية مع نفس النادي؟',
      options: ['كارلو أنشيلوتي', 'بيب غوارديولا', 'زين الدين زيدان', 'جوزيه مورينيو'],
      correctAnswer: 2,
      points: 400,
      difficulty: 'medium',
      explanation: 'زين الدين زيدان حقق اللقب مع ريال مدريد أعوام 2016 و2017 و2018.'
    },
    {
      id: 'ucl-5',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'champions-league',
      subcategoryName: 'دوري أبطال أوروبا',
      question: 'أي نادٍ فاز بريمونتادا 6-1 الشهيرة ضد باريس سان جيرمان عام 2017 بتوقيع سيرجي روبيرتو؟',
      options: ['ريال مدريد', 'برشلونة', 'بايرن ميونخ', 'تشيلسي'],
      correctAnswer: 1,
      points: 200,
      difficulty: 'easy',
      explanation: 'برشلونة قلب خسارة الذهاب 0-4 إلى فوز تاريخي 6-1 في الكامب نو.'
    },
    {
      id: 'ucl-6',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'champions-league',
      subcategoryName: 'دوري أبطال أوروبا',
      question: 'من هو اللاعب الأكثر تتويجاً بلقب دوري أبطال أوروبا في التاريخ (6 ألقاب) مناصفة مع خنتو ومودريتش وكروس وناتشو وكارفخال؟',
      options: ['كريستيانو رونالدو', 'لوكا مودريتش', 'ليونيل ميسي', 'باولو مالديني'],
      correctAnswer: 1,
      points: 600,
      difficulty: 'hard',
      explanation: 'لوكا مودريتش وداني كارفخال وكروس وناتشو وصلوا للقب السادس معادلاً رقم باكو خنتو.'
    },

    // ==========================================
    // 4. كأس العالم (World Cup 2006, 2010, 2014, 2018, 2022, 2026)
    // ==========================================
    {
      id: 'wc-1',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'world-cup-2022',
      subcategoryName: 'كأس العالم 2022',
      question: 'أي منتخب حقق المركز الرابع التاريخي في كأس العالم قطر 2022 كأول منتخب عربي وأفريقي؟',
      options: ['السنغال', 'المغرب', 'تونس', 'الكاميرون'],
      correctAnswer: 1,
      points: 200,
      difficulty: 'easy',
      explanation: 'أسود الأطلس منتخب المغرب حققوا إنجازاً تاريخياً بالتأهل لنصف نهائي مونديال قطر 2022.'
    },
    {
      id: 'wc-2',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'world-cup-2022',
      subcategoryName: 'كأس العالم 2022',
      question: 'من فاز بجائزة هداف كأس العالم (الحذاء الذهبي) 2022 بتسجيله هاتريك في النهائي؟',
      options: ['ليونيل ميسي', 'كيليان مبابي', 'أوليفييه جيرو', 'جوليان ألفاريز'],
      correctAnswer: 1,
      points: 200,
      difficulty: 'easy',
      explanation: 'كيليان مبابي سجل 8 أهداف منها ثلاثية تاريخية في النهائي أمام الأرجنتين.'
    },
    {
      id: 'wc-3',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'world-cup',
      subcategoryName: 'كأس العالم التاريخي',
      question: 'من هو الهداف التاريخي لبطولات كأس العالم برصيد 16 هدفاً؟',
      options: ['رونالدو البرازيلي', 'ميروسلاف كلوزه', 'غيرد مولر', 'بيليه'],
      correctAnswer: 1,
      points: 400,
      difficulty: 'medium',
      explanation: 'الألماني ميروسلاف كلوزه كسر الرقم في مونديال البرازيل 2014 برصيد 16 هدفاً.'
    },
    {
      id: 'wc-4',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'world-cup',
      subcategoryName: 'كأس العالم 2006',
      question: 'ضد أي لاعب نطح زين الدين زيدان رأسيته الشهيرة في نهائي كأس العالم 2006 بين فرنسا وإيطاليا؟',
      options: ['فابيو كانافارو', 'ماركو ماتيراتزي', 'أليساندرو نيستا', 'جينارو غاتوزو'],
      correctAnswer: 1,
      points: 200,
      difficulty: 'easy',
      explanation: 'النطحة الشهيرة كانت في صدر ماركو ماتيراتزي في الشوط الإضافي الثاني ونال زيدان بطاقة حمراء.'
    },
    {
      id: 'wc-5',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'world-cup',
      subcategoryName: 'كأس العالم 2010',
      question: 'من سجل هدف الفوز القاتل لإسبانيا أمام هولندا في الدقيقة 116 في نهائي كأس العالم 2010؟',
      options: ['تشافي هيرنانديز', 'أندريس إنييستا', 'دافيد فيا', 'فيرناندو توريس'],
      correctAnswer: 1,
      points: 400,
      difficulty: 'medium',
      explanation: 'أندريس إنييستا سجل الهدف الخالد وأهدى إسبانيا لقبها المونديالي الأول.'
    },
    {
      id: 'wc-6',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'world-cup',
      subcategoryName: 'كأس العالم 2014',
      question: 'ما هي نتيجة مباراة ألمانيا والبرازيل التاريخية الصادمة في نصف نهائي مونديال 2014؟',
      options: ['5-0 لألمانيا', '6-1 لألمانيا', '7-1 لألمانيا', '4-1 لألمانيا'],
      correctAnswer: 2,
      points: 200,
      difficulty: 'easy',
      explanation: 'المباراة التاريخية في ملعب مينيراو انتهت بفوز كاسح للماكينات الألمانية 7-1.'
    },
    {
      id: 'wc-7',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'world-cup',
      subcategoryName: 'كأس العالم 2018',
      question: 'أي منتخب واجه فرنسا في نهائي كأس العالم روسيا 2018 وحقق الوصافة التاريخية؟',
      options: ['كرواتيا', 'بلجيكا', 'إنجلترا', 'الأرجنتين'],
      correctAnswer: 0,
      points: 200,
      difficulty: 'easy',
      explanation: 'كرواتيا بقيادة لوكا مودريتش حققت إنجاز الوصول لنهائي المونديال لأول مرة في تاريخها.'
    },
    {
      id: 'wc-8',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'world-cup',
      subcategoryName: 'كأس العالم 2026',
      question: 'كم عدد المنتخبات المشاركة في بطولة كأس العالم 2026 في أمريكا وكندا والمكسيك لأول مرة؟',
      options: ['32 منتخباً', '48 منتخباً', '40 منتخباً', '64 منتخباً'],
      correctAnswer: 1,
      points: 400,
      difficulty: 'medium',
      explanation: 'مونديال 2026 سيكون أول نسخة تضم 48 منتخباً في تاريخ بطولات كأس العالم.'
    },

    // ==========================================
    // 5. الأساطير: رونالدو & ميسي
    // ==========================================
    {
      id: 'cr7-1',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'ronaldo',
      subcategoryName: 'كريستيانو رونالدو',
      question: 'كم عدد الكرات الذهبية (Ballon d\'Or) التي فاز بها كريستيانو رونالدو في مسيرته؟',
      options: ['4 كرات', '5 كرات', '6 كرات', '7 كرات'],
      correctAnswer: 1,
      points: 200,
      difficulty: 'easy',
      explanation: 'فاز رونالدو بالكرة الذهبية 5 مرات (2008، 2013، 2014، 2016، 2017).'
    },
    {
      id: 'cr7-2',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'ronaldo',
      subcategoryName: 'كريستيانو رونالدو',
      question: 'ما هو النادي البرتغالي الذي بدأ فيه كريستيانو رونالدو مسيرته الاحترافية قبل مانشستر يونايتد؟',
      options: ['بورتو', 'بنفيكا', 'سبورتينغ لشبونة', 'براغا'],
      correctAnswer: 2,
      points: 200,
      difficulty: 'easy',
      explanation: 'تخرج الدون من أكاديمية سبورتينغ لشبونة وانتقل للشياطين الحمر عام 2003.'
    },
    {
      id: 'cr7-3',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'ronaldo',
      subcategoryName: 'كريستيانو رونالدو',
      question: 'كم هدفاً سجل كريستيانو رونالدو في دوري أبطال أوروبا ليكون هدافها التاريخي؟',
      options: ['130 هدفاً', '135 هدفاً', '140 هدفاً', '145 هدفاً'],
      correctAnswer: 2,
      points: 600,
      difficulty: 'hard',
      explanation: 'كريستيانو رونالدو يتربع على عرش هدافي التشامبيونز ليغ بـ 140 هدفاً.'
    },
    {
      id: 'messi-1',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'messi',
      subcategoryName: 'ليونيل ميسي',
      question: 'كم عدد الكرات الذهبية التي حصدها ليونيل ميسي القياسية؟',
      options: ['6 كرات', '7 كرات', '8 كرات', '9 كرات'],
      correctAnswer: 2,
      points: 200,
      difficulty: 'easy',
      explanation: 'ميسي هو اللاعب الأكثر تتويجاً بالكرة الذهبية عبر التاريخ بـ 8 كرات ذهبية.'
    },
    {
      id: 'messi-2',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'messi',
      subcategoryName: 'ليونيل ميسي',
      question: 'كم عدد الأهداف القياسية التي سجلها ميسي في سنة ميلادية واحدة (2012) مسجلاً رقماً قياسياً في غينيس؟',
      options: ['85 هدفاً', '88 هدفاً', '91 هدفاً', '93 هدفاً'],
      correctAnswer: 2,
      points: 400,
      difficulty: 'medium',
      explanation: 'سجل ميسي 91 هدفاً في عام 2012 محطماً رقم جيرد مولر التاريخي.'
    },

    // ==========================================
    // 6. الدوريات الإيطالي والألماني والفرنسي والمدربون
    // ==========================================
    {
      id: 'seriea-1',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'serie-a',
      subcategoryName: 'الدوري الإيطالي',
      question: 'أي نادٍ إيطالي توج بلقب الدوري الإيطالي التاريخي 2023 لأول مرة منذ 33 عاماً أيام مارادونا؟',
      options: ['نابولي', 'ميلان', 'إنتر ميلان', 'لاتسيو'],
      correctAnswer: 0,
      points: 200,
      difficulty: 'easy',
      explanation: 'نابولي بقيادة سباليتي وأوسيمين وكفاراتسخيليا حقق الاسكوديتو التاريخي 2023.'
    },
    {
      id: 'bundes-1',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'bundesliga',
      subcategoryName: 'الدوري الألماني',
      question: 'أي فريق صنع المعجزة وتوج بلقب الدوري الألماني بدون أي هزيمة موسم 2023-2024 بقيادة تشابي ألونسو؟',
      options: ['بايرن ميونخ', 'بوروسيا دورتموند', 'باير ليفركوزن', 'لايبزيغ'],
      correctAnswer: 2,
      points: 200,
      difficulty: 'easy',
      explanation: 'باير ليفركوزن حقق أول لقب دوري في تاريخه وبلا أي هزيمة مسجلاً رقماً تاريخياً.'
    },
    {
      id: 'coaches-1',
      category: 'football',
      categoryName: 'كرة القدم',
      subcategory: 'coaches',
      subcategoryName: 'المدربون الأساطير',
      question: 'من هو المدرب الملقب بـ "The Special One" (الاستثنائي) وقاد بورتو وإنتر للقب الأبطال؟',
      options: ['جوزيه مورينيو', 'بيب غوارديولا', 'يورغن كلوب', 'كارلو أنشيلوتي'],
      correctAnswer: 0,
      points: 200,
      difficulty: 'easy',
      explanation: 'البرتغالي جوزيه مورينيو أطلق على نفسه اللقب الشهير في أول مؤتمر مع تشيلسي.'
    },

    // ==========================================
    // 7. باب الحارة والمسلسلات والأفلام
    // ==========================================
    {
      id: 'series-1',
      category: 'series',
      categoryName: 'مسلسلات وأفلام',
      subcategory: 'bab-al-hara',
      subcategoryName: 'باب الحارة',
      question: 'ما اسم الحارة الشامية الشهيرة التي تدور فيها أحداث الأجزاء الأولى من مسلسل "باب الحارة"؟',
      options: ['حارة الضبع', 'حارة القبة', 'حارة أبو النار', 'حارة الماوي'],
      correctAnswer: 0,
      points: 200,
      difficulty: 'easy',
      explanation: 'حارة الضبع هي الحارة المركزية وزعيمها أبو عصام والعكيد أبو شهاب.'
    },
    {
      id: 'series-2',
      category: 'series',
      categoryName: 'مسلسلات وأفلام',
      subcategory: 'bab-al-hara',
      subcategoryName: 'باب الحارة',
      question: 'ما هي العبارة الشهيرة واللازمة الكلامية للعكيد أبو شهاب في باب الحارة؟',
      options: ['شكلين ما بحكي', 'يا باطل', 'ابن عمي يا بعدي', 'سجّل عندك يا تاريخ'],
      correctAnswer: 0,
      points: 200,
      difficulty: 'easy',
      explanation: 'العكيد أبو شهاب (سامر المصري) اشتهر بعبارة "شكلين ما بحكي".'
    },
    {
      id: 'series-3',
      category: 'series',
      categoryName: 'مسلسلات وأفلام',
      subcategory: 'bab-al-hara',
      subcategoryName: 'باب الحارة',
      question: 'ما هي مهنة "أبو عصام" (عباس النوري) في حارة الضبع؟',
      options: ['حلاق الحارة والطب الشعبي', 'تاجر قماش', 'مختار الحارة', 'حداد الحارة'],
      correctAnswer: 0,
      points: 200,
      difficulty: 'easy',
      explanation: 'أبو عصام كان حلاق الحارة ومداوي الجرحى والمعالج الشعبي.'
    },
    {
      id: 'series-4',
      category: 'series',
      categoryName: 'مسلسلات وأفلام',
      subcategory: 'bab-al-hara',
      subcategoryName: 'باب الحارة',
      question: 'ما هي العبارة الكوميدية الشهيرة للشخصية الطريفة "النمس" (مصطفى الخاني)؟',
      options: ['يا ناموسة وينك', 'هلا والله حيا الله أهلاً وسهلاً بالشباب', 'الله حيو يا بعدي', 'ولاك عوايني'],
      correctAnswer: 1,
      points: 400,
      difficulty: 'medium',
      explanation: 'النمس اشتهر بلازمته "هلا والله حيا الله إيه نعم بالشباب" وحركاته الطريفة.'
    },
    {
      id: 'series-5',
      category: 'series',
      categoryName: 'مسلسلات وأفلام',
      subcategory: 'arabic-series',
      subcategoryName: 'مسلسلات عربية',
      question: 'ما اسم الشخصية التي جسدها الفنان يحيى الفخراني في المسلسل الصعيدي الشهير "الليل وآخره"؟',
      options: ['رحيم المنشاوي', 'جعفر العمدة', 'عباس الأبيض', 'منصور المغازي'],
      correctAnswer: 0,
      points: 400,
      difficulty: 'medium',
      explanation: 'رحيم المنشاوي من أعظم الأدوار الدرامية في تاريخ الدراما المصرية.'
    },
    {
      id: 'series-6',
      category: 'series',
      categoryName: 'مسلسلات وأفلام',
      subcategory: 'global-movies',
      subcategoryName: 'أفلام عالمية',
      question: 'ما هو الفيلم الحائز على 11 جائزة أوسكار من بطولة ليوناردو دي كابريو وكيت وينسلت عام 1997؟',
      options: ['تايتانيك (Titanic)', 'أفاتار (Avatar)', 'المصارع (Gladiator)', 'إنسبشن (Inception)'],
      correctAnswer: 0,
      points: 200,
      difficulty: 'easy',
      explanation: 'فيلم Titanic للمخرج جيمس كاميرون حقق 11 أوسكار وكسر الأرقام القياسية في شباك التذاكر.'
    },
    {
      id: 'series-7',
      category: 'series',
      categoryName: 'مسلسلات وأفلام',
      subcategory: 'global-series',
      subcategoryName: 'مسلسلات عالمية',
      question: 'من هو بطل مسلسل (Breaking Bad) مدرس الكيمياء الذي تحول لتاجر مواد ممنوعة باسم "هايزنبرغ"؟',
      options: ['والتر وايت', 'جيسي بينكمان', 'غوستافو فرينغ', 'سول غودمان'],
      correctAnswer: 0,
      points: 200,
      difficulty: 'easy',
      explanation: 'والتر وايت جسده الممثل برايان كرانستون وحقق عنه جوائز إيمي متعددة.'
    },
    {
      id: 'series-8',
      category: 'series',
      categoryName: 'مسلسلات وأفلام',
      subcategory: 'global-series',
      subcategoryName: 'مسلسلات عالمية',
      question: 'ما هو اسم العصابة الإنجليزية الشهيرة في مدينة برمنغهام بزعامة توماس شيلبي؟',
      options: ['بيكي بلايندرز (Peaky Blinders)', 'العراب (Godfather)', 'السوبرانو', 'عصابة شيلبي'],
      correctAnswer: 0,
      points: 200,
      difficulty: 'easy',
      explanation: 'عصابة البيكي بلايندرز اشتهرت بالقبعات التي تخفي شفرات حلاقة بقيادة كيليان ميرفي.'
    },

    // ==========================================
    // 8. معلومات عامة وثقافة عالمية
    // ==========================================
    {
      id: 'gen-1',
      category: 'general',
      categoryName: 'معلومات عامة',
      subcategory: 'culture',
      subcategoryName: 'ثقافة عامة',
      question: 'ما هي عاصمة أستراليا الفيدرالية الرسمية؟',
      options: ['سيدني', 'ملبورن', 'كانبرا', 'بريزبن'],
      correctAnswer: 2,
      points: 200,
      difficulty: 'easy',
      explanation: 'كانبرا هي العاصمة الرسمية لأستراليا وليست سيدني كما يعتقد الكثيرون.'
    },
    {
      id: 'gen-2',
      category: 'general',
      categoryName: 'معلومات عامة',
      subcategory: 'culture',
      subcategoryName: 'ثقافة عامة',
      question: 'ما هو أكبر كوكب في المجموعة الشمسية حجماً؟',
      options: ['زحل', 'المشتري', 'نبتون', 'أورانوس'],
      correctAnswer: 1,
      points: 200,
      difficulty: 'easy',
      explanation: 'المشتري (Jupiter) هو أضخم كواكب المجموعة الشمسية بأكثر من ضعف كتلة باقي الكواكب مجتمعة.'
    },
    {
      id: 'gen-3',
      category: 'general',
      categoryName: 'معلومات عامة',
      subcategory: 'culture',
      subcategoryName: 'ثقافة عامة',
      question: 'ما هي العملة الرسمية في دولة اليابان؟',
      options: ['اليوان', 'الوون', 'الين', 'الرينغيت'],
      correctAnswer: 2,
      points: 200,
      difficulty: 'easy',
      explanation: 'الين الياباني (JPY) هو العملة الرسمية في اليابان.'
    },
    {
      id: 'gen-4',
      category: 'general',
      categoryName: 'معلومات عامة',
      subcategory: 'sports-general',
      subcategoryName: 'رياضة عامة',
      question: 'كم عدد اللاعبين في فريق كرة السلة داخل أرضية الملعب لكل فريق؟',
      options: ['4 لاعبين', '5 لاعبين', '6 لاعبين', '7 لاعبين'],
      correctAnswer: 1,
      points: 200,
      difficulty: 'easy',
      explanation: 'يتكون فريق كرة السلة داخل الملعب من 5 لاعبين.'
    },
    {
      id: 'gen-5',
      category: 'general',
      categoryName: 'معلومات عامة',
      subcategory: 'sports-general',
      subcategoryName: 'رياضة عامة',
      question: 'من هو العداء الجامايكي الأسطوري صاحب الرقم القياسي العالمي لسباق 100 متر (9.58 ثانية)؟',
      options: ['يوسين بولت', 'يوهان بليك', 'تايسون غاي', 'أسافا باول'],
      correctAnswer: 0,
      points: 200,
      difficulty: 'easy',
      explanation: 'يوسين بولت حقق الرقم الأسطوري 9.58 ثانية في برلين 2009.'
    },
    {
      id: 'gen-6',
      category: 'general',
      categoryName: 'معلومات عامة',
      subcategory: 'sports-general',
      subcategoryName: 'رياضة عامة',
      question: 'من هو لاعب التنس الصربي صاحب الرقم القياسي لأكثر عدد بطولات غراند سلام في التاريخ (24 لقباً)؟',
      options: ['رافاييل نادال', 'روجر فيدرير', 'نوفاك دجوكوفيتش', 'كارلوس ألكاراز'],
      correctAnswer: 2,
      points: 400,
      difficulty: 'medium',
      explanation: 'نوفاك دجوكوفيتش انفرد بالرقم التاريخي بـ 24 لقباً كبيراً.'
    },

    // ==========================================
    // 9. فئة خاصة للبنات (Girls Category)
    // ==========================================
    {
      id: 'girls-1',
      category: 'girls',
      categoryName: 'فئة البنات',
      subcategory: 'fashion-beauty',
      subcategoryName: 'موضة وجمال',
      question: 'من هي مصممة الأزياء الفرنسية الشهيرة ومؤسسة واحدة من أرقى دور الأزياء والعطور باسم "No. 5"؟',
      options: ['كوكو شانيل', 'دوناتيللا فيرساتشي', 'كارولينا هيريرا', 'مياوتشيا برادا'],
      correctAnswer: 0,
      points: 200,
      difficulty: 'easy',
      explanation: 'كوكو شانيل أسست دار شانيل وأطلقت العطر الأشهر في العالم شانيل رقم 5.'
    },
    {
      id: 'girls-2',
      category: 'girls',
      categoryName: 'فئة البنات',
      subcategory: 'fashion-beauty',
      subcategoryName: 'موضة وجمال',
      question: 'ما هو حمض الهيالورونيك (Hyaluronic Acid) المستخدم بكثرة في العناية بالبشرة؟',
      options: ['مادة فعالة لترطيب البشرة وحبس الرطوبة', 'مقشر كيميائي قوي', 'مادة لتبييض الأسنان', 'زيت نباتي طبيعي'],
      correctAnswer: 0,
      points: 200,
      difficulty: 'easy',
      explanation: 'حمض الهيالورونيك قادر على حبس ما يصل إلى 1000 ضعف وزنه من الماء لترطيب فائق.'
    },
    {
      id: 'girls-3',
      category: 'girls',
      categoryName: 'فئة البنات',
      subcategory: 'lifestyle',
      subcategoryName: 'منوعات البنات',
      question: 'أي من الأحجار الكريمة التالية يتميز بلونه الأحمر الياقوتي الجذاب؟',
      options: ['الزمرد', 'الروبي (الياقوت الأحمر)', 'التوباز', 'الزفير (الأزرق)'],
      correctAnswer: 1,
      points: 400,
      difficulty: 'medium',
      explanation: 'الروبي (Ruby) هو الياقوت الأحمر الكريم ويرمز للفخامة والشغف.'
    },

    // ==========================================
    // 10. رياضيات وألغاز ذكاء (Math & Puzzles)
    // ==========================================
    {
      id: 'math-1',
      category: 'math',
      categoryName: 'رياضيات وذكاء',
      subcategory: 'mental-math',
      subcategoryName: 'حساب سريع',
      question: 'ما هو حاصل ضرب 15 × 14 ذهنياً؟',
      options: ['190', '200', '210', '225'],
      correctAnswer: 2,
      points: 200,
      difficulty: 'easy',
      explanation: '15 × 14 = 15 × (10 + 4) = 150 + 60 = 210.'
    },
    {
      id: 'math-2',
      category: 'math',
      categoryName: 'رياضيات وذكاء',
      subcategory: 'puzzles',
      subcategoryName: 'ألغاز منطقية',
      question: 'إذا كان عمر أحمد 3 أضعاف عمر أخيه الصغير، وبعد 5 سنوات أصبح مجموع عمريهما 38 سنة، فكم عمر أحمد الآن؟',
      options: ['21 سنة', '24 سنة', '18 سنة', '27 سنة'],
      correctAnswer: 0,
      points: 400,
      difficulty: 'medium',
      explanation: 'س + 3س + 10 = 38 => 4س = 28 => س = 7. إذن عمر أحمد 3 × 7 = 21 سنة.'
    },
    {
      id: 'math-3',
      category: 'math',
      categoryName: 'رياضيات وذكاء',
      subcategory: 'mental-math',
      subcategoryName: 'حساب سريع',
      question: 'ما هو الجذر التربيعي للعدد 289؟',
      options: ['15', '17', '19', '18'],
      correctAnswer: 1,
      points: 400,
      difficulty: 'medium',
      explanation: '17 × 17 = 289.'
    },

    // ==========================================
    // 11. لغة عربية وجذور وجموع (Arabic Language)
    // ==========================================
    {
      id: 'arabic-1',
      category: 'arabic',
      categoryName: 'لغة عربية',
      subcategory: 'plurals',
      subcategoryName: 'جموع نادرة',
      question: 'ما هو جمع كلمة "عندليب" في المعاجم العربية؟',
      options: ['عناديل', 'عنادل', 'عنادلب', 'عنادلية'],
      correctAnswer: 1,
      points: 400,
      difficulty: 'medium',
      explanation: 'جمع عندليب هو "عَنَادِل" بحذف الياء والباء الزائدة على صيغة منتهى الجموع.'
    },
    {
      id: 'arabic-2',
      category: 'arabic',
      categoryName: 'لغة عربية',
      subcategory: 'roots',
      subcategoryName: 'جذور الكلمات',
      question: 'ما هو الجذر اللغوي الثلاثي لكلمة "مستشفى"؟',
      options: ['شفي', 'شفا', 'مشف', 'تشف'],
      correctAnswer: 0,
      points: 200,
      difficulty: 'easy',
      explanation: 'جذر كلمة مستشفى هو (ش - ف - ي).'
    },
    {
      id: 'arabic-3',
      category: 'arabic',
      categoryName: 'لغة عربية',
      subcategory: 'plurals',
      subcategoryName: 'جموع نادرة',
      question: 'ما هو جمع كلمة "أخطبوط" في اللغة العربية؟',
      options: ['أخاطب', 'أخابيط', 'أخاطيب', 'خطابيط'],
      correctAnswer: 2,
      points: 600,
      difficulty: 'hard',
      explanation: 'جمع أخطبوط في المعاجم هو "أخاطيب".'
    },
    {
      id: 'arabic-4',
      category: 'arabic',
      categoryName: 'لغة عربية',
      subcategory: 'vocabulary',
      subcategoryName: 'فصاحة وبلاغة',
      question: 'ماذا يسمى صوت الماء العذب الجاري في اللغة العربية؟',
      options: ['الخرير', 'الحفيف', 'الصليل', 'الأنين'],
      correctAnswer: 0,
      points: 200,
      difficulty: 'easy',
      explanation: 'الخرير هو صوت خرير الماء، والحفيف للشجر، والصليل للسيوف.'
    }
  ];

  return baseQuestions;
}

// ==========================================
// 12. تحديات مزاد كرة القدم (Football Auction Round)
// ==========================================
export function getAuctionChallenges() {
  return [
    {
      id: 'auc-1',
      title: 'أندية حققت لقب دوري أبطال أوروبا',
      description: 'كم نادياً أوروبياً فاز بلقب دوري أبطال أوروبا (التشامبيونز ليغ) يمكنك أنت وفريقك تسميته؟',
      hint: 'المجموع الكلي: 23 نادياً فازوا باللقب عبر التاريخ',
      startingBid: 3,
      timeSeconds: 45,
      pointsReward: 500,
      validAnswers: [
        'ريال مدريد', 'ميلان', 'بايرن ميونخ', 'ليفربول', 'برشلونة',
        'أياكس', 'مانشستر يونايتد', 'إنتر ميلان', 'يوفنتوس', 'بنفيكا',
        'تشيلسي', 'نوتينغهام فورست', 'بورتو', 'مانشستر سيتي', 'بوروسيا دورتموند',
        'سيلتيك', 'هامبورغ', 'ستيوا بوخارست', 'مارسيليا', 'فينورد', 'أستون فيلا', 'ريد ستار بلغراد', 'أيندهوفن'
      ]
    },
    {
      id: 'auc-2',
      title: 'لاعبون توجوا بالكرة الذهبية (Ballon d\'Or)',
      description: 'كم لاعباً في تاريخ كرة القدم فاز بجائزة الكرة الذهبية يمكنك تسميته؟',
      hint: 'من عام 1956 حتى اليوم',
      startingBid: 4,
      timeSeconds: 45,
      pointsReward: 600,
      validAnswers: [
        'ليونيل ميسي', 'كريستيانو رونالدو', 'ميشيل بلاتيني', 'يوهان كرويف', 'ماركو فان باستن',
        'زين الدين زيدان', 'رونالدينيو', 'رونالدو الظاهرة', 'كاكا', 'لوكا مودريتش',
        'كريم بنزيما', 'رودري', 'ريفالدو', 'لويس فيغو', 'أندري شيفتشينكو',
        'فابيو كانافارو', 'مايكل أوين', 'بافل نيدفيد', 'روبرتو باجيو', 'جورج ويا', 'دي ستيفانو'
      ]
    },
    {
      id: 'auc-3',
      title: 'هدافو بطولات كأس العالم عبر التاريخ',
      description: 'كم لاعباً سجل 6 أهداف فأكثر في تاريخ بطولات كأس العالم يمكنك ذكره؟',
      hint: 'أساطير المونديال مثل كلوزه، رونالدو، ميسي، مبابي...',
      startingBid: 3,
      timeSeconds: 45,
      pointsReward: 500,
      validAnswers: [
        'ميروسلاف كلوزه', 'رونالدو البرازيلي', 'غيرد مولر', 'جوست فونتين', 'ليونيل ميسي',
        'كيليان مبابي', 'بيليه', 'ساندور كوتشيس', 'يورغن كلينسمان', 'هيلموت ران',
        'غابرييل باتيستوتا', 'توماس مولر', 'تيوفيلو كوبيلاس', 'غجيغوج لاتو', 'خاميس رودريغيز'
      ]
    },
    {
      id: 'auc-4',
      title: 'لاعبون ارتدوا قميص ريال مدريد وبرشلونة',
      description: 'كم لاعباً مثل كلاً من الغريمين (ريال مدريد وبرشلونة) يمكنك تسميته؟',
      hint: 'من بينهم فيغو، رونالدو، إيتو، إنريكي...',
      startingBid: 3,
      timeSeconds: 45,
      pointsReward: 600,
      validAnswers: [
        'لويس فيغو', 'رونالدو البرازيلي', 'لويس إنريكي', 'صامويل إيتو', 'مايكل لاودروب',
        'بيرند شوستر', 'خافيير سافيولا', 'ألبيرت سيلاديس', 'جورجي هاجي', 'روبرت بروسينتشكي'
      ]
    },
    {
      id: 'auc-5',
      title: 'مدربون حققوا لقب الدوري الإنجليزي الممتاز',
      description: 'كم مدرباً نجح في التتويج بلقب البريميرليغ منذ انطلاقه عام 1992؟',
      hint: 'المجموع الكلي: 11 مدرباً فقط في التاريخ!',
      startingBid: 3,
      timeSeconds: 45,
      pointsReward: 500,
      validAnswers: [
        'أليكس فيرغسون', 'أرسين فينغر', 'جوزيه مورينيو', 'بيب غوارديولا', 'كلاوديو رانييري',
        'يورغن كلوب', 'كارلو أنشيلوتي', 'روبرتو مانشيني', 'مانويل بيليغريني', 'أنطونيو كونتي', 'كيني دالغليش'
      ]
    },
    {
      id: 'auc-6',
      title: 'منتخبات وصلت لنهائي كأس العالم',
      description: 'كم منتخباً وطنياً نجح في خوض نهائي كأس العالم في تاريخ البطولة؟',
      hint: 'المجموع الكلي: 13 دولة فقط!',
      startingBid: 4,
      timeSeconds: 45,
      pointsReward: 500,
      validAnswers: [
        'البرازيل', 'ألمانيا', 'إيطاليا', 'الأرجنتين', 'فرنسا',
        'أوروغواي', 'إنجلترا', 'إسبانيا', 'هولندا', 'كرواتيا',
        'المجر', 'تشيكوسلوفاكيا', 'السويد'
      ]
    }
  ];
}

// ==========================================
// 13. أهداف سكتش (Goal Sketches - Animated / Visual Diagrams)
// ==========================================
export function getGoalSketches() {
  return [
    {
      id: 'sketch-1',
      title: 'ركنية الغفلة التاريخية (Corner Taken Quickly...)',
      year: 2019,
      match: 'ليفربول 4 - 0 برشلونة (نصف نهائي الأبطال)',
      description: 'الظهير الأيمن يتظاهر بالابتعاد عن الركنية ثم ينفذها بسرعة خارقة نحو المهاجم المنفرد الخالي من الرقابة!',
      passSequence: ['ألكسندر أرنولد (ركنية أرضية باغتت دفاع برشلونة)', 'ديفوك أوريغي (تسديدة مباشرة في الشباك)'],
      options: [
        'أرنولد إلى أوريغي ضد برشلونة',
        'دي بروين إلى هالاند ضد أرسنال',
        'كروس إلى رونالدو ضد بايرن',
        'مودريتش إلى بنزيما ضد باريس'
      ],
      correctAnswer: 0,
      points: 400,
      diagram: {
        type: 'corner-cutback',
        startX: 95,
        startY: 5,
        targetX: 85,
        targetY: 45,
        keyPlayer: 'Trent Alexander-Arnold'
      }
    },
    {
      id: 'sketch-2',
      title: 'هدف القرن ومراوغة نصف الملعب الخرافية',
      year: 1986,
      match: 'الأرجنتين 2 - 1 إنجلترا (كأس العالم مكسيكو 86)',
      description: 'استلم الكرة في دائرة منتصف ملعبه، راوغ 5 لاعبين وحارس المرمى بيتر شيلتون على مسافة 60 متراً مسجلاً أعظم أهداف التاريخ!',
      passSequence: ['انطلاقة فردية إعجازية لمارادونا من دائرة المنتصف بمراوغة 5 مدافعين'],
      options: [
        'دييغو مارادونا ضد إنجلترا',
        'ليونيل ميسي ضد خيتافي',
        'بيليه ضد إيطاليا',
        'رونالدو الظاهرة ضد كومبوستيلا'
      ],
      correctAnswer: 0,
      points: 400,
      diagram: {
        type: 'solo-dribble',
        startX: 50,
        startY: 50,
        targetX: 95,
        targetY: 50,
        keyPlayer: 'Diego Maradona'
      }
    },
    {
      id: 'sketch-3',
      title: 'المقصية المزدوجة المذهلة في الهواء',
      year: 2018,
      match: 'يوفنتوس 0 - 3 ريال مدريد (تورينو)',
      description: 'عرضية متقنة من الظهير الأيمن، ارتقاء خيالي على ارتفاع 2.38 متر ومقصية مزدوجة نالت تصفيق جماهير الخصم وقوفاً!',
      passSequence: ['داني كارفخال (عرضية من الجناح الأيمن)', 'كريستيانو رونالدو (دبل كيك مقصي في المقص الأيسر لبوفون)'],
      options: [
        'كريستيانو رونالدو ضد يوفنتوس',
        'غاريث بيل ضد ليفربول',
        'واين روني ضد مانشستر سيتي',
        'زلاتان إبراهيموفيتش ضد إنجلترا'
      ],
      correctAnswer: 0,
      points: 400,
      diagram: {
        type: 'bicycle-kick',
        startX: 85,
        startY: 20,
        targetX: 88,
        targetY: 50,
        keyPlayer: 'Cristiano Ronaldo'
      }
    },
    {
      id: 'sketch-4',
      title: 'رأسية العاشرة القاتلة في الدقيقة 92:48',
      year: 2014,
      match: 'ريال مدريد 4 - 1 أتلتيكو مدريد (نهائي لشبونة)',
      description: 'ركنية في الدقيقة الأخيرة من الوقت بدل الضائع، ارتقاء كابتن الدفاع برأسية نارية أدركت التعادل وأحيت حلم اللقب العاشر!',
      passSequence: ['لوكا مودريتش (ركنية متقنة في الدقيقة 93)', 'سيرجيو راموس (رأسية قوية على يمين كورتوا)'],
      options: [
        'سيرجيو راموس ضد أتلتيكو مدريد',
        'غودين ضد برشلونة',
        'دروغبا ضد بايرن ميونخ',
        'بويول ضد ألمانيا'
      ],
      correctAnswer: 0,
      points: 400,
      diagram: {
        type: 'header-corner',
        startX: 95,
        startY: 95,
        targetX: 88,
        targetY: 52,
        keyPlayer: 'Sergio Ramos'
      }
    },
    {
      id: 'sketch-5',
      title: 'تيكي تاكا نهائي لوسيل الأسطوري',
      year: 2022,
      match: 'الأرجنتين 3 - 3 فرنسا (نهائي كأس العالم قطر 2022)',
      description: '5 لمسات سحرية من لمسة واحدة بدأت من ميسي ثم ألفاريز إلى ماك أليستر المنطلق، الذي أهداها على طبق من ذهب للجناح الأيسر ليضعها في الشباك!',
      passSequence: ['ميسي لمسة بكعب القدم', 'ألفاريز تمريرة بينية', 'ماك أليستر عرضية متقنة', 'أنخيل دي ماريا إنهاء ساحر'],
      options: [
        'أنخيل دي ماريا ضد فرنسا',
        'كيليان مبابي ضد الأرجنتين',
        'ميسي ضد كرواتيا',
        'غريزمان ضد المغرب'
      ],
      correctAnswer: 0,
      points: 600,
      diagram: {
        type: 'tiki-taka-counter',
        startX: 40,
        startY: 50,
        targetX: 90,
        targetY: 40,
        keyPlayer: 'Angel Di Maria'
      }
    }
  ];
}

// ==========================================
// 14. صوت المعلق (Commentator Voice & Quotes Clues)
// ==========================================
export function getCommentaryClues() {
  return [
    {
      id: 'comm-1',
      commentator: 'عصام الشوالي',
      quote: 'مستحيل.. مستحيل.. لا تسألني كيف! فعلها البرغوث في الثواني الأخيرة ورفع قميصه للتاريخ في معقل الخصم!',
      clue: 'الدقيقة 92 في ملعب سانتياغو برنابيو عام 2017 واحتفال رفع القميص التاريخي.',
      question: 'من سجل هذا الهدف الأيقوني وما هي نتيجة المباراة؟',
      options: [
        'ليونيل ميسي (فوز برشلونة 3-2)',
        'كريستيانو رونالدو (فوز ريال مدريد 2-1)',
        'سيرجيو راموس (تعادل 1-1)',
        'نيمار (فوز برشلونة 4-3)'
      ],
      correctAnswer: 0,
      points: 400
    },
    {
      id: 'comm-2',
      commentator: 'رؤوف خليف',
      quote: 'يوزع.. يلعب كووووورة.. غووووووووول! نعم إنه الدون، طار في الهواء كأنه طائرة حربية لا ترحم الشباك!',
      clue: 'ارتقاء إعجازي بارتفاع 2.56 متر وظل معلقاً في الهواء لمدة 1.5 ثانية عام 2019.',
      question: 'ضد أي فريق سجل كريستيانو رونالدو هذا الهدف الرأسي مع يوفنتوس؟',
      options: ['سامبدوريا', 'أتلتيكو مدريد', 'ميلان', 'إنتر ميلان'],
      correctAnswer: 0,
      points: 400
    },
    {
      id: 'comm-3',
      commentator: 'حفيظ دراجي',
      quote: 'أووووه لا لا لا لا.. حطها في الجول يا رياض! في أقصى الزاوية التسعين يا رياض!',
      clue: 'ركلة حرة مباشرة تاريخية في الدقيقة 95 لنصف نهائي كأس أمم أفريقيا 2019 ضد نيجيريا.',
      question: 'من سدد هذه الركلة الحرة الخالدة لمنتخب الجزائر؟',
      options: ['رياض محرز', 'بغداد بونجاح', 'يوسف بلايلي', 'سفيان فيغولي'],
      correctAnswer: 0,
      points: 200
    },
    {
      id: 'comm-4',
      commentator: 'فارس عوض',
      quote: 'يا رباه.. مستحيل يا عالم! الدوري الإنجليزي يرفض أن ينتهي! أغويروووووووووووووووووو!',
      clue: 'الدقيقة 93:20 في 13 مايو 2012، أول لقب بريميرليغ لمانشستر سيتي بعد غياب 44 عاماً.',
      question: 'ضد أي نادٍ سجل سيرجيو أجويرو هذا الهدف التاريخي؟',
      options: ['كوينز بارك رينجرز (QPR)', 'سندرلاند', 'ستوك سيتي', 'نيوكاسل يونايتد'],
      correctAnswer: 0,
      points: 400
    },
    {
      id: 'comm-5',
      commentator: 'عصام الشوالي',
      quote: 'عرضية والدربكة وجووووووووول! غدارة غدارة.. بل أنت الساحر يا إنييستا!',
      clue: 'الدقيقة 93 في ستامفورد بريدج 2009 بتسديدة من خارج منطقة الجزاء قادت برشلونة لنهائي روما.',
      question: 'ضد أي نادٍ سجل أندريس إنييستا هذا الهدف الشهير في دوري أبطال أوروبا؟',
      options: ['تشيلسي', 'مانشستر يونايتد', 'بايرن ميونخ', 'أرسنال'],
      correctAnswer: 0,
      points: 400
    }
  ];
}

// ==========================================
// 15. تمثيل شخصيات ولاعبين (Charades / Acting Cards)
// ==========================================
export function getCharadesCards() {
  return [
    {
      id: 'char-1',
      name: 'العكيد أبو شهاب',
      category: 'باب الحارة',
      emoji: '🗡️',
      tabooWords: ['باب الحارة', 'حارة الضبع', 'شكلين ما بحكي', 'سامر المصري'],
      difficulty: 'سهل',
      hint: 'شوارب مفتولة، مشية هيبة، سحب الخنجر من الخصر'
    },
    {
      id: 'char-2',
      name: 'أبو عصام',
      category: 'باب الحارة',
      emoji: '💈',
      tabooWords: ['عباس النوري', 'حلاق', 'دكتور', 'سعاد'],
      difficulty: 'سهل',
      hint: 'حركات الحلاقة ومداواة الجروح والهدوء والتأمل'
    },
    {
      id: 'char-3',
      name: 'النمس',
      category: 'باب الحارة',
      emoji: '🦎',
      tabooWords: ['مصطفى الخاني', 'ناموسة', 'هلا والله', 'عوايني'],
      difficulty: 'متوسط',
      hint: 'غمز بالعين، طرطقة الأصابع، وميلان الرأس السريع'
    },
    {
      id: 'char-4',
      name: 'توماس شيلبي (Peaky Blinders)',
      category: 'مسلسلات عالمية',
      emoji: '🎩',
      tabooWords: ['برمنغهام', 'قبعة', 'سيجارة', 'كيليان ميرفي'],
      difficulty: 'متوسط',
      hint: 'تعديل حافة القبعة، تدخين السيجارة بنظرة باردة حادة'
    },
    {
      id: 'char-5',
      name: 'كريستيانو رونالدو (احتفال SIUUU)',
      category: 'أساطير كرة القدم',
      emoji: '⚽',
      tabooWords: ['الدون', 'رونالدو', 'ريال مدريد', 'النصر'],
      difficulty: 'سهل',
      hint: 'الركض نحو الراية، القفزة في الهواء، وفتح الذراعين بقوة مع الصرخة الصامتة'
    },
    {
      id: 'char-6',
      name: 'بيب غوارديولا',
      category: 'مدربون',
      emoji: '👔',
      tabooWords: ['مانشستر سيتي', 'برشلونة', 'أصلع', 'مدرب'],
      difficulty: 'متوسط',
      hint: 'فرك الرأس الصلعاء باليدين، العصبية الشديدة على خط التماس والتوجيه المستمر'
    },
    {
      id: 'char-7',
      name: 'الجوكر (Joker)',
      category: 'أفلام سينما',
      emoji: '🃏',
      tabooWords: ['باتمان', 'ضحكة', 'مكياج', 'هيث ليدجر'],
      difficulty: 'سهل',
      hint: 'الضحك الهستيري مع وضع اليدين على الفم وتمايل الجسد'
    },
    {
      id: 'char-8',
      name: 'إيرلينغ هالاند (احتفال اليوغا)',
      category: 'كرة قدم',
      emoji: '🧘',
      tabooWords: ['مانشستر سيتي', 'نرويجي', 'هداف', 'أشقر'],
      difficulty: 'سهل',
      hint: 'الجلوس على الأرض بوضعية التأمل واليوغا مع إغلاق العينين'
    }
  ];
}

// ==========================================
// 16. تشكيلة (Lineup Challenge Matches - 6 Classic Finals)
// ==========================================
export function getLineupMatches() {
  return [
    {
      id: 'match-ucl-2017',
      title: 'نهائي دوري أبطال أوروبا 2017',
      subtitle: 'ريال مدريد (4) - (1) يوفنتوس',
      stadium: 'ملعب الألفية - كارديف',
      year: 2017,
      teamA: {
        name: 'ريال مدريد',
        formation: '4-3-1-2',
        logo: '👑',
        players: [
          { number: 1, name: 'كيلور نافاس', position: 'GK', prevClub: 'ليفانتي', options: ['ليفانتي', 'ألباسيتي', 'سابريسا', 'خيتافي'] },
          { number: 2, name: 'داني كارفاخال', position: 'RB', prevClub: 'باير ليفركوزن', options: ['باير ليفركوزن', 'إسبانيول', 'فالنسيا', 'خيتافي'] },
          { number: 4, name: 'سيرجيو راموس', position: 'CB', prevClub: 'إشبيلية', options: ['إشبيلية', 'بيتيس', 'ملقة', 'أتلتيكو مدريد'] },
          { number: 5, name: 'رافاييل فاران', position: 'CB', prevClub: 'لانس الفرنسي', options: ['لانس الفرنسي', 'ليل', 'موناكو', 'ليون'] },
          { number: 12, name: 'مارسيلو', position: 'LB', prevClub: 'فلومينينسي', options: ['فلومينينسي', 'فلامنغو', 'سانتوس', 'كورينثيانز'] },
          { number: 14, name: 'كاسيميرو', position: 'DM', prevClub: 'بورتو البرتغالي', options: ['بورتو البرتغالي', 'ساو باولو', 'بنفيكا', 'سانتوس'] },
          { number: 8, name: 'توني كروس', position: 'CM', prevClub: 'بايرن ميونخ', options: ['بايرن ميونخ', 'باير ليفركوزن', 'دورتموند', 'بريمن'] },
          { number: 19, name: 'لوكا مودريتش', position: 'CM', prevClub: 'توتنهام هوتسبير', options: ['توتنهام هوتسبير', 'دينامو زغرب', 'أرسنال', 'تشيلسي'] },
          { number: 22, name: 'إيسكو', position: 'AM', prevClub: 'ملقة الإسباني', options: ['ملقة الإسباني', 'فالنسيا', 'فياريال', 'إشبيلية'] },
          { number: 9, name: 'كريم بنزيما', position: 'ST', prevClub: 'أولمبيك ليون', options: ['أولمبيك ليون', 'مارسيليا', 'بوردو', 'موناكو'] },
          { number: 7, name: 'كريستيانو رونالدو', position: 'ST', prevClub: 'مانشستر يونايتد', options: ['مانشستر يونايتد', 'سبورتينغ لشبونة', 'يوفنتوس', 'أرسنال'] }
        ]
      },
      teamB: {
        name: 'يوفنتوس',
        formation: '4-2-3-1',
        logo: '⚪⚫',
        players: [
          { number: 1, name: 'جانلويجي بوفون', position: 'GK', prevClub: 'بارما', options: ['بارما', 'فيورنتينا', 'جنوى', 'سامبدوريا'] },
          { number: 23, name: 'داني ألفيس', position: 'RB', prevClub: 'برشلونة', options: ['برشلونة', 'إشبيلية', 'باريس سان جيرمان', 'باهيا'] },
          { number: 19, name: 'ليوناردو بونوتشي', position: 'CB', prevClub: 'باري الإيطالي', options: ['باري الإيطالي', 'إنتر ميلان', 'ميلان', 'بيسكارا'] },
          { number: 3, name: 'جورجيو كيلليني', position: 'CB', prevClub: 'فيورنتينا', options: ['فيورنتينا', 'ليفورنو', 'روما', 'لاتسيو'] },
          { number: 12, name: 'أليكس ساندرو', position: 'LB', prevClub: 'بورتو البرتغالي', options: ['بورتو البرتغالي', 'سانتوس', 'بنفيكا', 'ساو باولو'] },
          { number: 5, name: 'ميراليم بيانيتش', position: 'CM', prevClub: 'روما', options: ['روما', 'ليون', 'ميتز', 'يوفنتوس'] },
          { number: 6, name: 'سامي خضيرة', position: 'CM', prevClub: 'ريال مدريد', options: ['ريال مدريد', 'شتوتغارت', 'شالكه', 'دورتموند'] },
          { number: 17, name: 'ماريو ماندزوكيتش', position: 'LM', prevClub: 'أتلتيكو مدريد', options: ['أتلتيكو مدريد', 'بايرن ميونخ', 'فولفسبورغ', 'دينامو زغرب'] },
          { number: 21, name: 'باولو ديبالا', position: 'AM', prevClub: 'باليرمو', options: ['باليرمو', 'إنستيتوتو', 'كاتانيا', 'سامبدوريا'] },
          { number: 7, name: 'خوان كوادرادو', position: 'RM', prevClub: 'تشيلسي', options: ['تشيلسي', 'فيورنتينا', 'أودينيزي', 'ليتشي'] },
          { number: 9, name: 'غونزالو هيغواين', position: 'ST', prevClub: 'نابولي', options: ['نابولي', 'ريال مدريد', 'ريفربليت', 'ميلان'] }
        ]
      }
    },
    {
      id: 'match-wc-2022',
      title: 'نهائي كأس العالم 2022',
      subtitle: 'الأرجنتين (3) 4 - 2 (3) فرنسا',
      stadium: 'استاد لوسيل - قطر',
      year: 2022,
      teamA: {
        name: 'الأرجنتين',
        formation: '4-3-3',
        logo: '🇦🇷',
        players: [
          { number: 23, name: 'إيميليانو مارتينيز', position: 'GK', prevClub: 'أستون فيلا', options: ['أستون فيلا', 'أرسنال', 'خيتافي', 'ريدينغ'] },
          { number: 26, name: 'ناهويل مولينا', position: 'RB', prevClub: 'أتلتيكو مدريد', options: ['أتلتيكو مدريد', 'أودينيزي', 'بوكا جونيورز', 'روزاريو'] },
          { number: 13, name: 'كريستيان روميرو', position: 'CB', prevClub: 'توتنهام هوتسبير', options: ['توتنهام هوتسبير', 'أتالانتا', 'يوفنتوس', 'جنوى'] },
          { number: 19, name: 'نيكولاس أوتاميندي', position: 'CB', prevClub: 'بنفيكا', options: ['بنفيكا', 'مانشستر سيتي', 'فالنسيا', 'بورتو'] },
          { number: 3, name: 'نيكولاس تاليافيكو', position: 'LB', prevClub: 'ليون الفرنسي', options: ['ليون الفرنسي', 'أياكس أمستردام', 'إنديبندينتي', 'مورسيا'] },
          { number: 7, name: 'رودريغو دي بول', position: 'CM', prevClub: 'أتلتيكو مدريد', options: ['أتلتيكو مدريد', 'أودينيزي', 'فالنسيا', 'راسينغ'] },
          { number: 24, name: 'إنزو فيرنانديز', position: 'CM', prevClub: 'بنفيكا', options: ['بنفيكا', 'ريفربليت', 'ديفينسا', 'تشيلسي'] },
          { number: 20, name: 'أليكسيس ماك أليستر', position: 'CM', prevClub: 'برايتون', options: ['برايتون', 'بوكا جونيورز', 'أرجنتينوس', 'ليفربول'] },
          { number: 11, name: 'أنخيل دي ماريا', position: 'LW', prevClub: 'يوفنتوس', options: ['يوفنتوس', 'باريس سان جيرمان', 'مانشستر يونايتد', 'ريال مدريد'] },
          { number: 9, name: 'جوليان ألفاريز', position: 'ST', prevClub: 'مانشستر سيتي', options: ['مانشستر سيتي', 'ريفربليت', 'أتلتيكو مدريد', 'ريال مدريد'] },
          { number: 10, name: 'ليونيل ميسي', position: 'RW', prevClub: 'باريس سان جيرمان', options: ['باريس سان جيرمان', 'برشلونة', 'نيولز أولد بويز', 'إنتر ميامي'] }
        ]
      },
      teamB: {
        name: 'فرنسا',
        formation: '4-3-3',
        logo: '🇫🇷',
        players: [
          { number: 1, name: 'هوغو لوريس', position: 'GK', prevClub: 'توتنهام هوتسبير', options: ['توتنهام هوتسبير', 'ليون', 'نيس', 'مارسيليا'] },
          { number: 5, name: 'جول كوندي', position: 'RB', prevClub: 'برشلونة', options: ['برشلونة', 'إشبيلية', 'بوردو', 'موناكو'] },
          { number: 4, name: 'رافاييل فاران', position: 'CB', prevClub: 'مانشستر يونايتد', options: ['مانشستر يونايتد', 'ريال مدريد', 'لانس', 'باريس'] },
          { number: 18, name: 'دايوت أوباميكانو', position: 'CB', prevClub: 'بايرن ميونخ', options: ['بايرن ميونخ', 'لايبزيغ', 'سالزبورغ', 'فالنسيان'] },
          { number: 22, name: 'ثيو هيرنانديز', position: 'LB', prevClub: 'ميلان الإيطالي', options: ['ميلان الإيطالي', 'ريال مدريد', 'ريال سوسيداد', 'أتلتيكو مدريد'] },
          { number: 8, name: 'أوريليان تشواميني', position: 'CM', prevClub: 'ريال مدريد', options: ['ريال مدريد', 'موناكو', 'بوردو', 'ليل'] },
          { number: 14, name: 'أدريان رابيو', position: 'CM', prevClub: 'يوفنتوس', options: ['يوفنتوس', 'باريس سان جيرمان', 'تولوز', 'مارسيليا'] },
          { number: 7, name: 'أنطوان غريزمان', position: 'AM', prevClub: 'أتلتيكو مدريد', options: ['أتلتيكو مدريد', 'برشلونة', 'ريال سوسيداد', 'ليون'] },
          { number: 11, name: 'عثمان ديمبيلي', position: 'RW', prevClub: 'برشلونة', options: ['برشلونة', 'بوروسيا دورتموند', 'رين', 'باريس'] },
          { number: 9, name: 'أوليفييه جيرو', position: 'ST', prevClub: 'ميلان الإيطالي', options: ['ميلان الإيطالي', 'تشيلسي', 'أرسنال', 'مونبلييه'] },
          { number: 10, name: 'كيليان مبابي', position: 'LW', prevClub: 'باريس سان جيرمان', options: ['باريس سان جيرمان', 'موناكو', 'كليرفونتين', 'ريال مدريد'] }
        ]
      }
    },
    {
      id: 'match-ucl-2011',
      title: 'نهائي دوري أبطال أوروبا 2011',
      subtitle: 'برشلونة (3) - (1) مانشستر يونايتد',
      stadium: 'استاد ويمبلي - لندن',
      year: 2011,
      teamA: {
        name: 'برشلونة',
        formation: '4-3-3',
        logo: '🔵🔴',
        players: [
          { number: 1, name: 'فيكتور فالديز', position: 'GK', prevClub: 'أكاديمية لاماسيا', options: ['أكاديمية لاماسيا', 'فياريال', 'إسبانيول', 'فالنسيا'] },
          { number: 2, name: 'داني ألفيس', position: 'RB', prevClub: 'إشبيلية', options: ['إشبيلية', 'باهيا', 'فالنسيا', 'بيتيس'] },
          { number: 3, name: 'جيرارد بيكيه', position: 'CB', prevClub: 'مانشستر يونايتد', options: ['مانشستر يونايتد', 'ريال سرقسطة', 'أرسنال', 'ليفربول'] },
          { number: 14, name: 'خافيير ماسكيرانو', position: 'CB', prevClub: 'ليفربول', options: ['ليفربول', 'وست هام', 'كورينثيانز', 'ريفربليت'] },
          { number: 22, name: 'إيريك أبيدال', position: 'LB', prevClub: 'أولمبيك ليون', options: ['أولمبيك ليون', 'موناكو', 'ليل', 'نيس'] },
          { number: 16, name: 'سيرجيو بوسكيتس', position: 'DM', prevClub: 'برشلونة ب', options: ['برشلونة ب', 'جيمناستيك', 'ليفانتي', 'بادالونا'] },
          { number: 6, name: 'تشافي هيرنانديز', position: 'CM', prevClub: 'أكاديمية لاماسيا', options: ['أكاديمية لاماسيا', 'تيراسا', 'إسبانيول', 'جيرونا'] },
          { number: 8, name: 'أندريس إنييستا', position: 'CM', prevClub: 'أكاديمية لاماسيا', options: ['أكاديمية لاماسيا', 'ألباسيتي', 'فياريال', 'فالنسيا'] },
          { number: 17, name: 'بيدرو رودريغيز', position: 'RW', prevClub: 'برشلونة ب', options: ['برشلونة ب', 'تينيريفي', 'خيتافي', 'إسبانيول'] },
          { number: 7, name: 'دافيد فيا', position: 'LW', prevClub: 'فالنسيا', options: ['فالنسيا', 'ريال سرقسطة', 'سبورتينغ خيخون', 'أتلتيكو'] },
          { number: 10, name: 'ليونيل ميسي', position: 'CF', prevClub: 'نيولز أولد بويز', options: ['نيولز أولد بويز', 'ريفربليت', 'بوكا جونيورز', 'روزاريو'] }
        ]
      },
      teamB: {
        name: 'مانشستر يونايتد',
        formation: '4-4-2',
        logo: '🔴',
        players: [
          { number: 1, name: 'إدوين فان دير سار', position: 'GK', prevClub: 'فولهام', options: ['فولهام', 'يوفنتوس', 'أياكس', 'فينورد'] },
          { number: 20, name: 'فابيو دا سيلفا', position: 'RB', prevClub: 'فلومينينسي', options: ['فلومينينسي', 'سانتوس', 'ساو باولو', 'فلامنغو'] },
          { number: 5, name: 'ريو فرديناند', position: 'CB', prevClub: 'ليدز يونايتد', options: ['ليدز يونايتد', 'وست هام', 'بورنموث', 'إيفرتون'] },
          { number: 15, name: 'نيمانيا فيديتش', position: 'CB', prevClub: 'سبارتاك موسكو', options: ['سبارتاك موسكو', 'النجم الأحمر', 'سيسكا موسكو', 'دينامو'] },
          { number: 3, name: 'باتريس إيفرا', position: 'LB', prevClub: 'موناكو', options: ['موناكو', 'نيس', 'مونزا', 'مارسيليا'] },
          { number: 25, name: 'أنطونيو فالنسيا', position: 'RM', prevClub: 'ويغان أثلتيك', options: ['ويغان أثلتيك', 'فياريال', 'ريكرياتيفو', 'إل ناسيونال'] },
          { number: 16, name: 'مايكل كاريك', position: 'CM', prevClub: 'توتنهام هوتسبير', options: ['توتنهام هوتسبير', 'وست هام', 'سويندون', 'برمنغهام'] },
          { number: 11, name: 'ريان غيغز', position: 'CM', prevClub: 'مانشستر سيتي (أكاديمية)', options: ['مانشستر سيتي (أكاديمية)', 'سوانزي سيتي', 'كارديف سيتي', 'نيوبورت'] },
          { number: 13, name: 'بارك جي سونغ', position: 'LM', prevClub: 'أيندهوفن الهولندي', options: ['أيندهوفن الهولندي', 'كيوتو سانغا', 'سول', 'فينورد'] },
          { number: 10, name: 'واين روني', position: 'ST', prevClub: 'إيفرتون', options: ['إيفرتون', 'ليفربول', 'سلتيك', 'ليدز يونايتد'] },
          { number: 14, name: 'خافيير هيرنانديز (تشيتشاريتو)', position: 'ST', prevClub: 'غوادالاخارا المكسيكي', options: ['غوادالاخارا المكسيكي', 'أمريكا المكسيكي', 'مونتيري', 'تيغريس'] }
        ]
      }
    }
  ];
}

// ==========================================
// Roles for "لعبة مافيا" (Mafia Party Mode)
// ==========================================
export function getMafiaRoles() {
  return [
    {
      id: 'mafia',
      name: 'مافيا (القاتل)',
      team: 'mafia',
      emoji: '🕵️‍♂️',
      color: 'text-red-500',
      bgColor: 'bg-red-500/20 border-red-500',
      description: 'هدفك القضاء على المواطنين دون كشف هويتك. تستيقظ كل ليلة وتختار ضحيتك بالاتفاق مع المافيا الآخرين.',
      instructions: 'في الليل: اختر شخصاً لتصفيته. في النهار: تظاهر بأنك مواطن بريء وضلل التحقيق!'
    },
    {
      id: 'detective',
      name: 'المحقق (الشرطي)',
      team: 'citizens',
      emoji: '🔍',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/20 border-blue-500',
      description: 'أنت عين القانون السرية. تستيقظ ليلاً وتختار لاعباً لتكتشف هل هو من المافيا أم مواطن بريء.',
      instructions: 'في الليل: اختر شخصاً واحداً وافحصه. في النهار: أقنع الآخرين بالتصويت ضد المشتبه به بحكمة دون كشف نفسك للموت!'
    },
    {
      id: 'doctor',
      name: 'الطبيب (المسعف)',
      team: 'citizens',
      emoji: '🩺',
      color: 'text-green-500',
      bgColor: 'bg-green-500/20 border-green-500',
      description: 'أنت منقذ الأرواح. تستيقظ كل ليلة وتختار لاعباً واحداً لتحميه من القتل. يمكنك حماية نفسك أيضاً.',
      instructions: 'في الليل: اختر الشخص الذي تتوقع أن المافيا ستستهدفه. إذا تطابق اختيارك فسينجو!'
    },
    {
      id: 'citizen',
      name: 'المواطن الصالح',
      team: 'citizens',
      emoji: '👤',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/20 border-yellow-500',
      description: 'مواطن مسالم لا يملك قوى ليلية، لكن صوتك في التصويت النهاري هو سلاحك الأقوى لكشف المافيا والتخلص منهم.',
      instructions: 'في الليل: نام بسلام وأغمض عينيك. في النهار: راقب تصرفات الجميع، استمع لحججهم، وصوّت لإعدام المشبوهين!'
    }
  ];
}
