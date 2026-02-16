const express = require('express');
const router = express.Router();

const WELLNESS_TIPS = [
  { affirmation: 'I am stronger than my struggles, and every step forward matters.', tip: 'Try a 5-minute breathing exercise today.', link: { label: 'Box Breathing Guide', url: 'https://www.webmd.com/balance/what-is-box-breathing' } },
  { affirmation: 'I deserve happiness and I am worthy of a fresh start.', tip: 'Write down three things you are grateful for this morning.', link: { label: 'Gratitude Journaling Tips', url: 'https://ggia.berkeley.edu/practice/gratitude_journal' } },
  { affirmation: 'Every day is a new opportunity to grow and heal.', tip: 'Take a 10-minute walk outside and notice the nature around you.', link: { label: 'Benefits of Walking', url: 'https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/walking/art-20046261' } },
  { affirmation: 'I have the courage and strength to face today with grace.', tip: 'Drink a full glass of water first thing in the morning.', link: { label: 'Hydration & Wellness', url: 'https://www.cdc.gov/physical-activity-basics/benefits/index.html' } },
  { affirmation: 'I honor my progress, even on the hard days.', tip: 'Try a guided meditation for relaxation before bed.', link: { label: 'Free Guided Meditations', url: 'https://www.uclahealth.org/uclamindful/free-guided-meditations' } },
  { affirmation: 'My past does not define me. I am becoming who I am meant to be.', tip: 'Spend 5 minutes stretching to release tension in your body.', link: { label: 'Simple Stretching Routine', url: 'https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/stretching/art-20546848' } },
  { affirmation: 'I give myself permission to rest and recharge.', tip: 'Limit screen time 30 minutes before sleep for better rest.', link: { label: 'Sleep Hygiene Tips', url: 'https://www.nhlbi.nih.gov/health/sleep-deprivation/healthy-sleep-habits' } },
  { affirmation: 'I trust the process of my recovery and celebrate small wins.', tip: 'Call or text someone you care about today.', link: { label: 'Power of Social Connection', url: 'https://obssr.od.nih.gov/news-and-events/news/director-voice/science-social-connection' } },
  { affirmation: 'I choose peace and self-compassion today.', tip: 'Try eating one extra serving of fruits or vegetables today.', link: { label: 'Nutrition & Mood', url: 'https://www.health.harvard.edu/blog/nutritional-psychiatry-your-brain-on-food-201511168626' } },
  { affirmation: 'I am resilient, and I am building a life I love.', tip: 'Write a short letter of encouragement to your future self.', link: { label: 'Journaling for Mental Health', url: 'https://www.urmc.rochester.edu/encyclopedia/content?ContentTypeID=1&ContentID=4552' } },
  { affirmation: 'I release what I cannot control and focus on what I can.', tip: 'Try a new healthy recipe that excites you.', link: { label: 'Easy Healthy Recipes', url: 'https://www.eatwell101.com/category/healthy-recipes-recipes' } },
  { affirmation: 'I am proud of myself for showing up today.', tip: 'Spend a few minutes in sunlight to boost your vitamin D.', link: { label: 'Sunlight & Mental Health', url: 'https://health.clevelandclinic.org/how-much-sunshine-you-need-daily' } },
  { affirmation: 'Every positive choice I make is a victory.', tip: 'Practice saying "no" to one thing that drains your energy today.', link: { label: 'Setting Healthy Boundaries', url: 'https://www.psychologytoday.com/us/basics/boundaries' } },
  { affirmation: 'I am creating positive change in my life, one step at a time.', tip: 'Listen to a song that makes you feel uplifted and hopeful.', link: { label: 'Music & Wellbeing', url: 'https://www.health.harvard.edu/blog/can-music-improve-our-health-and-quality-of-life-202207252786' } },
  { affirmation: 'I welcome joy and peace into my day.', tip: 'Do one act of kindness for someone else today.', link: { label: 'Kindness & Happiness', url: 'https://www.psychiatry.org/news-room/apa-blogs/mental-health-benefits-simple-acts-of-kindness' } },
  { affirmation: 'I trust myself to make good decisions for my well-being.', tip: 'Organize one small area of your space for a sense of accomplishment.', link: { label: 'Decluttering & Mental Health', url: 'https://newsnetwork.mayoclinic.org/discussion/mayo-clinic-minute-mental-health-benefits-of-tidying-up/' } },
  { affirmation: 'I am capable of achieving great things.', tip: 'Set one small, achievable goal for today and celebrate completing it.', link: { label: 'Goal Setting for Wellness', url: 'https://www.mindtools.com/a5ykiuq/goal-setting' } },
  { affirmation: 'I choose to focus on the light in my life.', tip: 'Try a digital detox for one hour today — read, draw, or just be.', link: { label: 'Benefits of Unplugging', url: 'https://www.cleveland.org/health/articles/23382-digital-detox' } },
  { affirmation: 'I have overcome challenges before, and I will overcome them again.', tip: 'Take 3 slow, deep breaths whenever you feel overwhelmed today.', link: { label: 'Deep Breathing Techniques', url: 'https://www.healthline.com/health/breathing-exercises-for-anxiety' } },
  { affirmation: 'Taking care of myself is a priority, not a luxury.', tip: 'Schedule 15 minutes of "me time" today — no guilt allowed.', link: { label: 'Self-Care Ideas', url: 'https://www.nimh.nih.gov/health/topics/caring-for-your-mental-health' } },
  { affirmation: 'Today is the perfect day to start something new.', tip: 'Try a body scan meditation to reconnect with how you feel physically.', link: { label: 'Body Scan Meditation', url: 'https://www.mindful.org/beginners-body-scan-meditation/' } },
  { affirmation: 'My struggles are shaping me into a more compassionate person.', tip: 'Laugh today — watch a funny video or call a friend who makes you smile.', link: { label: 'Laughter & Health', url: 'https://www.mayoclinic.org/healthy-lifestyle/stress-management/in-depth/stress-relief/art-20044456' } },
  { affirmation: 'I trust that better days are ahead.', tip: 'Write down one thing that went well today before bed.', link: { label: 'Positive Reflection Practice', url: 'https://www.psychologytoday.com/us/blog/click-here-for-happiness/201801/how-to-start-a-gratitude-practice-to-change-your-life' } },
  { affirmation: 'I am growing from within, and it reflects in everything I do.', tip: 'Spend 10 minutes reading something inspiring or educational.', link: { label: 'Reading & Mental Health', url: 'https://www.healthline.com/health/benefits-of-reading-books' } },
  { affirmation: 'I am building a foundation for a brighter tomorrow.', tip: 'Drink herbal tea instead of coffee this afternoon for calmer energy.', link: { label: 'Herbal Teas for Relaxation', url: 'https://www.healthline.com/nutrition/herbal-tea-benefits' } },
  { affirmation: 'I believe in my ability to overcome any obstacle.', tip: 'Practice a random act of kindness — it boosts your own happiness too.', link: { label: 'Science of Kindness', url: 'https://www.dartmouth.edu/wellness/emotional/rakt.html' } },
  { affirmation: 'I am rebuilding, and my foundation is strong.', tip: 'Create a vision board or list of things you want in your future.', link: { label: 'Visualization Techniques', url: 'https://www.verywellmind.com/visualization-for-relaxation-2584112' } },
  { affirmation: 'I rise with purpose and determination every single day.', tip: 'End the day by naming three things you did well.', link: { label: 'Positive Self-Talk', url: 'https://www.mayoclinic.org/healthy-lifestyle/stress-management/in-depth/positive-thinking/art-20043950' } },
  { affirmation: 'I am worthy of love, especially from myself.', tip: 'Look in the mirror and say one kind thing to yourself.', link: { label: 'Self-Compassion Exercises', url: 'https://self-compassion.org/category/exercises/' } },
  { affirmation: 'I release yesterday and embrace the possibilities of today.', tip: 'Try coloring, doodling, or any creative outlet for 10 minutes.', link: { label: 'Art Therapy Benefits', url: 'https://www.healthline.com/health/art-therapy' } },
];

// Recovery-relevant verse references — rotated by day, text fetched from bible-api.com
const SCRIPTURE_REFS = [
  'Isaiah 40:29', 'Matthew 11:28', 'Philippians 4:13', 'Psalm 34:18',
  'Jeremiah 29:11', 'Psalm 46:1', '1 Peter 5:7', 'Joshua 1:9',
  'Isaiah 40:31', 'Deuteronomy 31:8', 'Psalm 147:3', 'Romans 12:2',
  '2 Corinthians 5:17', 'Romans 8:28', 'Psalm 56:3', 'Psalm 23:1-3',
  'John 14:27', 'Psalm 51:10', '1 Corinthians 10:13', 'Proverbs 3:5',
  '2 Corinthians 12:9', 'Psalm 34:17', 'Philippians 4:6', 'James 1:12',
  'Psalm 34:4', 'Isaiah 43:18-19', 'Zephaniah 3:17', 'Psalm 30:5',
  'Psalm 46:10', 'Lamentations 3:22-23',
];

async function fetchScripture(reference) {
  const res = await fetch(`https://bible-api.com/${encodeURIComponent(reference)}`);
  const data = await res.json();
  if (data && data.text) {
    return { verse: data.text.trim(), reference: data.reference || reference };
  }
  throw new Error('Unexpected bible-api response');
}

// Gentle bodyweight exercise IDs from wger.de — no equipment, safe for a 60-year-old in recovery
const EXERCISE_IDS = [
  177, // Cycling
  292, // Hip Raise, Lying
  458, // Plank
  570, // Shoulder Shrug
  580, // Side Plank
  632, // Sumo Squats
  713, // Wall Pushup
  716, // Wall Slides
  718, // Wall Squat
  957, // Quadruped Arm and Leg Raise
  260, // Full Sit Outs
  297, // Hollow Hold
  962, // Elliptical
];

async function fetchExercise(dayOfYear) {
  const exerciseId = EXERCISE_IDS[dayOfYear % EXERCISE_IDS.length];
  const res = await fetch(`https://wger.de/api/v2/exerciseinfo/${exerciseId}/?format=json`);
  const data = await res.json();
  if (data && Array.isArray(data.translations)) {
    const english = data.translations.find((t) => t.language === 2);
    if (english && english.name) {
      const raw = (english.description || '').replace(/<[^>]*>/g, '').trim();
      const description = raw || `Try ${english.name} today — movement is medicine for recovery.`;
      return {
        name: english.name,
        description: `${description} Take it at your own pace — listen to your body and rest when needed.`,
      };
    }
  }
  throw new Error('Unexpected wger response');
}

// In-memory cache
let cache = { date: null, data: null };

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

async function fetchQuoteOfTheDay() {
  const res = await fetch('https://zenquotes.io/api/today');
  const data = await res.json();
  if (Array.isArray(data) && data.length > 0) {
    return { quote: data[0].q, author: data[0].a };
  }
  throw new Error('Unexpected ZenQuotes response');
}

async function getInspiration() {
  const today = getTodayDateString();

  if (cache.date === today && cache.data) {
    return cache.data;
  }

  const dayOfYear = getDayOfYear();
  const wellness = WELLNESS_TIPS[dayOfYear % WELLNESS_TIPS.length];
  const scriptureRef = SCRIPTURE_REFS[dayOfYear % SCRIPTURE_REFS.length];

  // Fetch all three APIs in parallel
  const [quoteData, scripture, fitness] = await Promise.all([
    fetchQuoteOfTheDay().catch((err) => {
      console.error('ZenQuotes fetch failed, using fallback:', err.message);
      return { quote: 'Every moment is a fresh beginning.', author: 'T.S. Eliot' };
    }),
    fetchScripture(scriptureRef).catch((err) => {
      console.error('Bible API fetch failed, using fallback:', err.message);
      return { verse: 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.', reference: 'Joshua 1:9' };
    }),
    fetchExercise(dayOfYear).catch((err) => {
      console.error('Wger API fetch failed, using fallback:', err.message);
      return { name: 'Bodyweight Squats', description: 'Do 3 sets of 12 squats. Strong legs carry you forward in recovery and in life.' };
    }),
  ]);

  const result = {
    quote: `"${quoteData.quote}" — ${quoteData.author}`,
    author: quoteData.author,
    affirmation: wellness.affirmation,
    tip: wellness.tip,
    link: wellness.link,
    scripture,
    fitness,
  };

  cache = { date: today, data: result };
  return result;
}

router.get('/inspiration', async (req, res, next) => {
  try {
    const data = await getInspiration();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
