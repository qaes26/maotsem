// Dynamic Question & Challenge Generator for "حخلص عليك"
// Continuously generates unique, non-repeating rounds and questions

export function generateMathQuestion() {
  const types = ['multiply', 'equation', 'sequence', 'percentage', 'square'];
  const type = types[Math.floor(Math.random() * types.length)];

  if (type === 'multiply') {
    const a = Math.floor(Math.random() * 15) + 11; // 11-25
    const b = Math.floor(Math.random() * 15) + 11; // 11-25
    const correct = a * b;
    const offsets = [-20, -10, 10, 20, -15, 15].sort(() => 0.5 - Math.random());
    const options = [
      correct,
      correct + offsets[0],
      correct + offsets[1],
      correct + offsets[2],
    ].sort(() => 0.5 - Math.random());

    return {
      id: `gen-math-${Date.now()}-${Math.random()}`,
      category: 'math',
      categoryName: 'رياضيات وذكاء',
      subcategory: 'mental-math',
      subcategoryName: 'حساب سريع',
      question: `ما هو حاصل ضرب ${a} × ${b} ذهنياً؟`,
      options: options.map(String),
      correctAnswer: options.indexOf(correct),
      points: 200,
      difficulty: 'easy',
      explanation: `${a} × ${b} = ${correct}. طريقة سريعة: ${a} × ${Math.floor(b / 10) * 10} + ${a} × ${b % 10} = ${correct}`,
    };
  }

  if (type === 'percentage') {
    const percents = [15, 20, 25, 30, 40, 50, 75];
    const bases = [120, 160, 200, 240, 300, 400, 500, 800];
    const pct = percents[Math.floor(Math.random() * percents.length)];
    const base = bases[Math.floor(Math.random() * bases.length)];
    const correct = (pct * base) / 100;

    const options = [
      correct,
      correct + 10,
      correct - 10,
      correct + 25,
    ].sort(() => 0.5 - Math.random());

    return {
      id: `gen-math-${Date.now()}-${Math.random()}`,
      category: 'math',
      categoryName: 'رياضيات وذكاء',
      subcategory: 'mental-math',
      subcategoryName: 'حساب سريع',
      question: `ما هي قيمة ${pct}% من العدد ${base}؟`,
      options: options.map(String),
      correctAnswer: options.indexOf(correct),
      points: 400,
      difficulty: 'medium',
      explanation: `(${pct} ÷ 100) × ${base} = ${correct}`,
    };
  }

  if (type === 'sequence') {
    const start = Math.floor(Math.random() * 10) + 2;
    const diff = Math.floor(Math.random() * 5) + 3;
    const seq = [start, start + diff, start + diff * 2, start + diff * 3];
    const correct = start + diff * 4;

    const options = [
      correct,
      correct + diff,
      correct - diff,
      correct + 2,
    ].sort(() => 0.5 - Math.random());

    return {
      id: `gen-math-${Date.now()}-${Math.random()}`,
      category: 'math',
      categoryName: 'رياضيات وذكاء',
      subcategory: 'puzzles',
      subcategoryName: 'متتاليات ذكاء',
      question: `أكمل المتتالية العددية التالية: ${seq.join(' ، ')} ، ( ؟ )`,
      options: options.map(String),
      correctAnswer: options.indexOf(correct),
      points: 400,
      difficulty: 'medium',
      explanation: `النمط يزيد بمقدار (+${diff}) في كل خطوة، إذن الرقم التالي هو ${seq[3]} + ${diff} = ${correct}`,
    };
  }

  // Square
  const n = Math.floor(Math.random() * 16) + 12; // 12-27
  const correct = n * n;
  const options = [
    correct,
    correct + 10,
    correct - 20,
    (n - 1) * (n - 1),
  ].sort(() => 0.5 - Math.random());

  return {
    id: `gen-math-${Date.now()}-${Math.random()}`,
    category: 'math',
    categoryName: 'رياضيات وذكاء',
    subcategory: 'mental-math',
    subcategoryName: 'حساب سريع',
    question: `ما هو مربع العدد ${n} (${n}²)؟`,
    options: options.map(String),
    correctAnswer: options.indexOf(correct),
    points: 600,
    difficulty: 'hard',
    explanation: `${n} × ${n} = ${correct}`,
  };
}

// Arabic linguistic roots dynamic challenges
const ARABIC_WORDS = [
  { word: 'استغفار', root: 'غفر', distractors: ['سفر', 'عفر', 'وفر'] },
  { word: 'مستشفى', root: 'شفي', distractors: ['شفا', 'مشف', 'تشف'] },
  { word: 'انكسار', root: 'كسر', distractors: ['نكر', 'أسر', 'كير'] },
  { word: 'استعانة', root: 'عون', distractors: ['عين', 'عان', 'عنن'] },
  { word: 'انتصار', root: 'نصر', distractors: ['نتر', 'تصر', 'صرر'] },
  { word: 'محيط', root: 'حوط', distractors: ['حيط', 'متح', 'وحط'] },
  { word: 'ميزان', root: 'وزن', distractors: ['يزن', 'مزن', 'زان'] },
  { word: 'اتصال', root: 'وصل', distractors: ['صلل', 'تصل', 'أصل'] },
  { word: 'تاريخ', root: 'أرخ', distractors: ['ريخ', 'ورخ', 'ترخ'] },
  { word: 'سياسة', root: 'سوس', distractors: ['سيس', 'وسس', 'ياس'] },
  { word: 'رياضة', root: 'روض', distractors: ['ريض', 'ورض', 'راض'] },
  { word: 'سماء', root: 'سمو', distractors: ['سمي', 'سأم', 'مسو'] },
];

export function generateArabicRootQuestion() {
  const item = ARABIC_WORDS[Math.floor(Math.random() * ARABIC_WORDS.length)];
  const options = [item.root, ...item.distractors].sort(() => 0.5 - Math.random());

  return {
    id: `gen-arab-${Date.now()}-${Math.random()}`,
    category: 'arabic',
    categoryName: 'لغة عربية',
    subcategory: 'roots',
    subcategoryName: 'جذور الكلمات',
    question: `ما هو الجذر اللغوي الثلاثي لكلمة "${item.word}" في المعاجم العربية؟`,
    options: options,
    correctAnswer: options.indexOf(item.root),
    points: 400,
    difficulty: 'medium',
    explanation: `جذر كلمة (${item.word}) هو الأحرف الأصلية: (${item.root.split('').join(' - ')}).`,
  };
}

// Round builder that ensures fresh shuffled questions
export function generateFreshRound(baseQuestions, selectedCategoryIds) {
  const pointValues = [200, 400, 600];
  const grid = [];

  for (const catId of selectedCategoryIds) {
    const matching = baseQuestions.filter((q) => q.category === catId || q.subcategory === catId);
    const catName = matching[0]?.subcategoryName || matching[0]?.categoryName || catId;

    const columnQuestions = [];
    for (const pv of pointValues) {
      let qList = matching.filter((q) => q.points === pv);
      if (qList.length === 0) qList = matching;

      if (qList.length > 0) {
        const picked = qList[Math.floor(Math.random() * qList.length)];
        columnQuestions.push({ ...picked, points: pv });
      } else if (catId === 'math') {
        columnQuestions.push(generateMathQuestion());
      } else if (catId === 'arabic') {
        columnQuestions.push(generateArabicRootQuestion());
      } else {
        columnQuestions.push({
          id: `fallback-${catId}-${pv}-${Date.now()}`,
          question: `سؤال تحدي متجدد في ${catName} بقيمة ${pv} نقطة`,
          options: ['خيار 1', 'خيار 2', 'خيار 3', 'خيار 4'],
          correctAnswer: 0,
          points: pv,
          explanation: 'إجابة السؤال الصحيحة.',
        });
      }
    }

    grid.push({
      id: catId,
      name: catName,
      questions: columnQuestions,
    });
  }

  return grid;
}
