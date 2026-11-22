#!/usr/bin/env node
// ============================================
// 🎮 حخلص عليك (Seen Jeem) - Supabase Seed Script
// Seeds all game content from local questions.js into Supabase tables
// Run: node supabase/seed.js
// ============================================
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import {
  getQuestions,
  getAuctionChallenges,
  getGoalSketches,
  getCommentaryClues,
  getCharadesCards,
  getLineupMatches,
} from '../server/data/questions.js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.length < 10) {
  console.error('❌ Supabase credentials not found in .env');
  console.error('   Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seedCategories() {
  console.log('\n📂 Seeding categories...');
  const questions = getQuestions();

  // Extract unique categories and subcategories
  const catMap = new Map();
  for (const q of questions) {
    if (!catMap.has(q.category)) {
      let icon = '🎯';
      if (q.category === 'football') icon = '⚽';
      else if (q.category === 'series') icon = '🎬';
      else if (q.category === 'general') icon = '🌍';
      else if (q.category === 'girls') icon = '💄';
      else if (q.category === 'math') icon = '🔢';
      else if (q.category === 'arabic') icon = '📖';

      catMap.set(q.category, {
        slug: q.category,
        name: q.category,
        name_ar: q.categoryName || q.category,
        icon,
        parent_slug: null,
        sort_order: catMap.size,
        is_active: true,
        is_custom: false,
      });
    }

    if (q.subcategory && !catMap.has(q.subcategory)) {
      catMap.set(q.subcategory, {
        slug: q.subcategory,
        name: q.subcategory,
        name_ar: q.subcategoryName || q.subcategory,
        icon: catMap.get(q.category)?.icon || '🎯',
        parent_slug: q.category,
        sort_order: catMap.size,
        is_active: true,
        is_custom: false,
      });
    }
  }

  const categories = Array.from(catMap.values());
  const { data, error } = await supabase
    .from('categories')
    .upsert(categories, { onConflict: 'slug' })
    .select();

  if (error) {
    console.error('   ❌ Error seeding categories:', error.message);
  } else {
    console.log(`   ✅ Seeded ${data.length} categories`);
  }
}

async function seedQuestions() {
  console.log('\n❓ Seeding questions...');
  const questions = getQuestions();

  const rows = questions.map((q, idx) => ({
    category_slug: q.category,
    subcategory_slug: q.subcategory || null,
    question: q.question,
    options: q.options,
    correct_answer: q.correctAnswer,
    points: q.points,
    difficulty: q.difficulty || 'easy',
    explanation: q.explanation || null,
    media_type: q.mediaType || null,
    media_url: q.mediaUrl || null,
    is_active: true,
  }));

  // Insert in batches of 50
  let inserted = 0;
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50);
    const { data, error } = await supabase.from('questions').insert(batch).select();
    if (error) {
      console.error(`   ❌ Error seeding questions batch ${i}:`, error.message);
    } else {
      inserted += data.length;
    }
  }
  console.log(`   ✅ Seeded ${inserted} questions`);
}

async function seedAuctions() {
  console.log('\n🏷️ Seeding auction challenges...');
  const auctions = getAuctionChallenges();

  const rows = auctions.map((a, idx) => ({
    title: a.title,
    description: a.description,
    hint: a.hint,
    starting_bid: a.startingBid,
    time_seconds: a.timeSeconds,
    points_reward: a.pointsReward,
    valid_answers: a.validAnswers,
    is_active: true,
    sort_order: idx,
  }));

  const { data, error } = await supabase.from('auction_challenges').insert(rows).select();
  if (error) {
    console.error('   ❌ Error seeding auctions:', error.message);
  } else {
    console.log(`   ✅ Seeded ${data.length} auction challenges`);
  }
}

async function seedSketches() {
  console.log('\n⚽ Seeding goal sketches...');
  const sketches = getGoalSketches();

  const rows = sketches.map((s, idx) => ({
    title: s.title,
    year: s.year,
    match_name: s.match,
    description: s.description,
    pass_sequence: s.passSequence,
    options: s.options,
    correct_answer: s.correctAnswer,
    points: s.points,
    diagram: s.diagram,
    is_active: true,
    sort_order: idx,
  }));

  const { data, error } = await supabase.from('goal_sketches').insert(rows).select();
  if (error) {
    console.error('   ❌ Error seeding sketches:', error.message);
  } else {
    console.log(`   ✅ Seeded ${data.length} goal sketches`);
  }
}

async function seedCommentary() {
  console.log('\n🎙️ Seeding commentary clues...');
  const commentary = getCommentaryClues();

  const rows = commentary.map((c, idx) => ({
    commentator: c.commentator,
    quote: c.quote,
    clue: c.clue,
    question: c.question,
    options: c.options,
    correct_answer: c.correctAnswer,
    points: c.points,
    is_active: true,
    sort_order: idx,
  }));

  const { data, error } = await supabase.from('commentary_clues').insert(rows).select();
  if (error) {
    console.error('   ❌ Error seeding commentary:', error.message);
  } else {
    console.log(`   ✅ Seeded ${data.length} commentary clues`);
  }
}

async function seedCharades() {
  console.log('\n🎭 Seeding charades cards...');
  const charades = getCharadesCards();

  const rows = charades.map((ch, idx) => ({
    name: ch.name,
    category: ch.category,
    emoji: ch.emoji,
    taboo_words: ch.tabooWords,
    difficulty: ch.difficulty,
    hint: ch.hint,
    is_active: true,
    sort_order: idx,
  }));

  const { data, error } = await supabase.from('charades_cards').insert(rows).select();
  if (error) {
    console.error('   ❌ Error seeding charades:', error.message);
  } else {
    console.log(`   ✅ Seeded ${data.length} charades cards`);
  }
}

async function seedLineups() {
  console.log('\n👕 Seeding lineup matches...');
  const matches = getLineupMatches();

  const rows = matches.map((m, idx) => ({
    title: m.title,
    subtitle: m.subtitle,
    stadium: m.stadium,
    year: m.year,
    team_a: m.teamA,
    team_b: m.teamB,
    is_active: true,
    sort_order: idx,
  }));

  const { data, error } = await supabase.from('lineup_matches').insert(rows).select();
  if (error) {
    console.error('   ❌ Error seeding lineups:', error.message);
  } else {
    console.log(`   ✅ Seeded ${data.length} lineup matches`);
  }
}

// ==========================================
// MAIN SEED FUNCTION
// ==========================================
async function main() {
  console.log('🎮 ═══════════════════════════════════════');
  console.log('   حخلص عليك - Supabase Database Seeder');
  console.log('═══════════════════════════════════════');
  console.log(`\n🔗 Supabase URL: ${supabaseUrl}`);
  console.log('🔑 Using service role key\n');

  try {
    // Test connection
    const { data, error } = await supabase.from('game_settings').select('key').limit(1);
    if (error) {
      console.error('❌ Cannot connect to Supabase. Did you run the schema.sql first?');
      console.error('   Error:', error.message);
      console.error('\n📋 Steps:');
      console.error('   1. Go to your Supabase dashboard -> SQL Editor');
      console.error('   2. Paste and run the contents of supabase/schema.sql');
      console.error('   3. Then run this seed script again');
      process.exit(1);
    }
    console.log('✅ Connected to Supabase successfully!\n');

    await seedCategories();
    await seedQuestions();
    await seedAuctions();
    await seedSketches();
    await seedCommentary();
    await seedCharades();
    await seedLineups();

    console.log('\n🎉 ═══════════════════════════════════════');
    console.log('   All game data seeded successfully!');
    console.log('═══════════════════════════════════════\n');
  } catch (err) {
    console.error('\n💥 Unexpected error:', err.message);
    process.exit(1);
  }
}

main();
