import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");
  
  // Clean existing tables
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.post.deleteMany();
  await prisma.publication.deleteMany();
  await prisma.note.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  // 1. Create Users
  const alice = await prisma.user.create({
    data: {
      name: "Alice Vance",
      email: "alice@nexuspress.com",
      passwordHash,
      bio: "Astrophysicist and science communicator. Exploring the outer edges of the universe and deep tech.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: "Bob Sterling",
      email: "bob@nexuspress.com",
      passwordHash,
      bio: "Economist and behavior analyst. Deciphering the intersection of financial markets, history, and human psychology.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    },
  });

  const charlie = await prisma.user.create({
    data: {
      name: "Charlie Pen",
      email: "charlie@nexuspress.com",
      passwordHash,
      bio: "Creative writer, novelist, and philosopher. Investigating the art of storytelling and the nature of conscious experience.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    },
  });

  const reader = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john@example.com",
      passwordHash,
      bio: "Avid reader of science, economics, and philosophy. Fan of clean newsletters.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    },
  });

  console.log("Users created successfully.");

  // 2. Create Publications
  const pubAlice = await prisma.publication.create({
    data: {
      title: "The Cosmic Perspective",
      slug: "cosmic",
      description: "Exploring space, quantum mechanics, and the future of humanity through a scientific lens.",
      logo: "🪐",
      cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
      writerId: alice.id,
    },
  });

  const pubBob = await prisma.publication.create({
    data: {
      title: "Mind & Markets",
      slug: "markets",
      description: "Weekly letters dissecting economic trends, investing psychology, and systemic human behavior.",
      logo: "📈",
      cover: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800",
      writerId: bob.id,
    },
  });

  const pubCharlie = await prisma.publication.create({
    data: {
      title: "Scribe's Journal",
      slug: "scribe",
      description: "Essays on character building, deep subtext, and the philosophy of literary art.",
      logo: "✍️",
      cover: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800",
      writerId: charlie.id,
    },
  });

  console.log("Publications created successfully.");

  // 3. Create Posts
  // --- ALICE ---
  const postA1 = await prisma.post.create({
    data: {
      title: "The James Webb Telescope's New Revelation about Dark Matter",
      slug: "james-webb-dark-matter",
      excerpt: "Recent observations have stunned astrophysicists, calling into question our fundamental theories of galaxy formation and cosmic expansion.",
      content: `
        <h2>A Crack in the Cosmological Standard Model</h2>
        <p>For decades, the standard model of cosmology (Lambda-CDM) has successfully explained how our universe expanded from the Big Bang to its current state. However, recent data gathered by the James Webb Space Telescope (JWST) has introduced a thrilling anomaly.</p>
        <p>In analyzing several of the earliest galaxies, JWST observed that these cosmic structures are far more massive and mature than our models predicted. According to standard models, early galaxies should be small, diffuse clumps of gas. Instead, we are seeing fully formed spiral structures with hundreds of billions of stars, existing a mere 300 million years after the Big Bang.</p>
        <blockquote>"It's like finding a fully formed modern city in archaeological strata from the stone age," says Dr. Sarah Jenkins, lead researcher.</blockquote>
        <h2>Rethinking Dark Matter's Clumpiness</h2>
        <p>To explain how these galaxies grew so quickly, astrophysicists are turning to dark matter. Dark matter, which makes up roughly 85% of all matter in the universe, acts as a gravitational skeleton. If dark matter clumped together much faster or more intensely in the early universe than previously calculated, it could have pulled normal baryonic matter in rapidly, accelerating star formation.</p>
        <p>This article dives deep into the two primary competing theories arising from this data: warm dark matter (WDM) models and modifications to Einstein's general relativity. Stay tuned for a cosmic paradigm shift.</p>
      `,
      coverImage: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=800",
      status: "PUBLISHED",
      visibility: "PREMIUM",
      views: 1420,
      publicationId: pubAlice.id,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
  });

  const postA2 = await prisma.post.create({
    data: {
      title: "Why Humans Will Colonize Mars by 2050",
      slug: "mars-colonization-2050",
      excerpt: "The technological milestones, economic feasibility, and ethical questions behind making humanity a multi-planetary species.",
      content: `
        <h2>The Path to the Red Planet</h2>
        <p>Mars represents the next logical frontier for human exploration. It possesses resources that can support life, an atmosphere that can be thickened over time, and a 24.6-hour day that aligns with human circadian rhythms.</p>
        <p>In this essay, we break down the three primary milestones required to make human life on Mars a permanent reality by 2050:</p>
        <ul>
          <li><strong>Fully Reusable Heavy Launch Systems:</strong> Bringing down payload costs to under $50 per kilogram.</li>
          <li><strong>In-Situ Resource Utilization (ISRU):</strong> Synthesizing water, oxygen, and methane fuel directly from the Martian soil and atmosphere.</li>
          <li><strong>Radiation Mitigation:</strong> Developing subsurface habitats and active magnetic shielding to protect pioneers from solar and cosmic radiation.</li>
        </ul>
        <p>We are closer than ever to seeing these developments manifest. The next decade will define whether we remain bound to a single cradle or expand into the stars.</p>
      `,
      coverImage: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800",
      status: "PUBLISHED",
      visibility: "FREE",
      views: 3120,
      publicationId: pubAlice.id,
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    },
  });

  // --- BOB ---
  const postB1 = await prisma.post.create({
    data: {
      title: "The Psychology of Market Crashes: Fear, Greed, and Algorithms",
      slug: "psychology-of-market-crashes",
      excerpt: "Behind every major economic sell-off lies a volatile mix of human behavior, evolutionary panic, and feedback loop code.",
      content: `
        <h2>The Panic Instinct</h2>
        <p>Markets are often treated as rational systems reflecting all available information in real-time. But in reality, they are massive coordination games governed by human emotion. During a downturn, rational calculations are overridden by the oldest part of the human brain: the amygdala.</p>
        <p>When asset prices slide past a certain threshold, the fear of missing out (FOMO) instantly reverses into the fear of loss. This induces panic selling, a behavior that mirrors migratory flight or herd panic in animals. Historically, this panic was mediated by traders shouting on exchange floors. Today, it is accelerated by algorithmic execution.</p>
        <h2>The Cascading Feedback Loops</h2>
        <p>Algorithmic trading accounts for over 70% of market volume. These algorithms are programmed to manage risk by automatically selling assets when volatility rises. This creates a dangerous positive feedback loop: price drops trigger algorithmic sells, which drop the price further, triggering more selling.</p>
        <p>Understanding this systemic volatility is crucial for long-term investors. To survive a market crash, one must master the psychology of contrarianism: buying when the crowd panics and holding cash when the crowd is euphoric.</p>
      `,
      coverImage: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800",
      status: "PUBLISHED",
      visibility: "FREE",
      views: 2840,
      publicationId: pubBob.id,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  const postB2 = await prisma.post.create({
    data: {
      title: "Is Inflation Actually Dead? The Structural Case for Higher Rates",
      slug: "is-inflation-dead",
      excerpt: "While short-term inflation metrics are cooling down, macro-dynamics suggest we are entering an era of persistent price pressures.",
      content: `
        <h2>The Mirage of Transitory Cool-Downs</h2>
        <p>Central banks are celebrating the return of consumer price indices to their target bounds. However, this relief is likely temporary. Beneath the surface, three structural macro shifts are occurring that will keep inflation higher for the next decade:</p>
        <ol>
          <li><strong>Deglobalization:</strong> The unwinding of hyper-efficient, low-cost supply chains in favor of resilient, domestic nearshoring.</li>
          <li><strong>Demographic Reversal:</strong> The aging of the global workforce, which reduces surplus labor supply and pushes up wages.</li>
          <li><strong>Green Transition:</strong> The immense capital expenditures required to rewire the world's energy grid, inducing resource supply squeezes.</li>
        </ol>
        <p>These secular trends mean the era of zero-percent interest rates is over. Investors who plan their portfolios based on the interest rate regimes of the 2010s will find themselves severely exposed in the 2020s and 2030s.</p>
      `,
      coverImage: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800",
      status: "PUBLISHED",
      visibility: "PREMIUM",
      views: 920,
      publicationId: pubBob.id,
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
  });

  // --- CHARLIE ---
  const postC1 = await prisma.post.create({
    data: {
      title: "How to Build Worlds That Feel Alive",
      slug: "how-to-build-worlds",
      excerpt: "Worldbuilding isn't about compiling massive encyclopedias. It is about the art of selective details and ecological coherence.",
      content: `
        <h2>The Encyclopedia Trap</h2>
        <p>Many aspiring fantasy and science fiction writers spend months drafting maps, plotting family lineages, and compiling languages before writing a single word of narrative. This is the encyclopedia trap, and it often results in sterile, lifeless prose.</p>
        <p>A world feels alive not when the reader knows everything about it, but when they feel the weight of what remains unsaid. This is what J.R.R. Tolkien referred to as the 'aspect of distance'—the suggestion of a history and geography extending far beyond the borders of the current page.</p>
        <h2>Principles of Coherent Worlds</h2>
        <p>To write engaging worlds, focus on these three layers of design:</p>
        <ul>
          <li><strong>Ecological Influence:</strong> How does geography shape culture? A desert society will have different idioms, religions, and architectural styles than an archipelago nation.</li>
          <li><strong>Friction:</strong> Avoid utopian or monocultural societies. Conflict arises from resources, beliefs, and history. Show the dust, the disputes, and the decay.</li>
          <li><strong>Sensory Contrast:</strong> Describe the smells of a market, the drafts under doors, the taste of cheap ale. Ground the epic in the mundane.</li>
        </ul>
      `,
      coverImage: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800",
      status: "PUBLISHED",
      visibility: "FREE",
      views: 1850,
      publicationId: pubCharlie.id,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  const postC2 = await prisma.post.create({
    data: {
      title: "The Art of the Unspoken: Subtext in Modern Dialogue",
      slug: "art-of-the-unspoken",
      excerpt: "In real life, people rarely say exactly what they mean. In great fiction, dialogue is a dance of subtext, avoidance, and power plays.",
      content: `
        <h2>The Multi-Layered Dialogue</h2>
        <p>When characters speak, their dialogue should perform multiple duties simultaneously. It should advance the plot, reveal personality, and conceal their true motives. If a character is sad and says, 'I am sad,' that is bad writing. Instead, they should argue about the cleanliness of a teacup.</p>
        <p>Subtext is the tension between what is thought and what is spoken. It occurs in three main ways:</p>
        <ol>
          <li><strong>Avoidance:</strong> Characters talk about anything other than the painful core topic (e.g., discussing weather to avoid talking about an impending divorce).</li>
          <li><strong>Power Plays:</strong> Using polite phrasing to assert dominance or control over another character.</li>
          <li><strong>Double Meanings:</strong> Phrasing that sounds innocent to a third party but carries a secondary, loaded message to the intended listener.</li>
        </ol>
        <p>Let's study examples from Raymond Carver and Ernest Hemingway to see how omitting words creates emotional gravity.</p>
      `,
      coverImage: "https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=800",
      status: "PUBLISHED",
      visibility: "PREMIUM",
      views: 880,
      publicationId: pubCharlie.id,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("Posts created successfully.");

  // 4. Subscriptions
  await prisma.subscription.createMany({
    data: [
      // Bob subscribes to Alice (Free)
      { userId: bob.id, publicationId: pubAlice.id, tier: "FREE" },
      // Charlie subscribes to Alice (Premium subscriber)
      { userId: charlie.id, publicationId: pubAlice.id, tier: "PREMIUM" },
      // Reader subscribes to Alice (Free)
      { userId: reader.id, publicationId: pubAlice.id, tier: "FREE" },

      // Alice subscribes to Bob (Premium)
      { userId: alice.id, publicationId: pubBob.id, tier: "PREMIUM" },
      // Reader subscribes to Bob (Free)
      { userId: reader.id, publicationId: pubBob.id, tier: "FREE" },

      // Alice subscribes to Charlie (Free)
      { userId: alice.id, publicationId: pubCharlie.id, tier: "FREE" },
      // Bob subscribes to Charlie (Free)
      { userId: bob.id, publicationId: pubCharlie.id, tier: "FREE" },
    ],
  });

  console.log("Subscriptions seeded.");

  // 5. Likes and Comments
  await prisma.like.createMany({
    data: [
      { userId: bob.id, postId: postA2.id },
      { userId: reader.id, postId: postA2.id },
      { userId: charlie.id, postId: postA1.id }, // premium user likes premium post
      { userId: alice.id, postId: postB1.id },
      { userId: reader.id, postId: postB1.id },
      { userId: alice.id, postId: postC1.id },
      { userId: bob.id, postId: postC1.id },
    ],
  });

  await prisma.comment.createMany({
    data: [
      { content: "Massive implications. Will this require changes to our estimates of dark energy too?", userId: charlie.id, postId: postA1.id },
      { content: "This makes so much sense! Reusability is the absolute bottleneck.", userId: reader.id, postId: postA2.id },
      { content: "Contrast this with the 1929 and 2008 crashes—algorithms certainly speed up the drop but also seem to find floors faster.", userId: alice.id, postId: postB1.id },
      { content: "Excellent breakdown of worldbuilding mechanics. The 'aspect of distance' is what makes Middle Earth so magical.", userId: alice.id, postId: postC1.id },
    ],
  });

  console.log("Likes and comments seeded.");

  // 6. Notes (Microblogging Feed)
  await prisma.note.createMany({
    data: [
      { content: "Just read the latest JWST data on early galaxies. Genuinely mind-boggling. Our textbook models of cosmic structure might need a complete rewrite.", userId: alice.id, likes: 24 },
      { content: "The yield curve remains inverted, yet consumer confidence index is rising. We are in a historically unique macro environment. Patience is the ultimate edge right now.", userId: bob.id, likes: 18 },
      { content: "Pro tip for writers: if your scene feels flat, look at what the characters *aren't* saying. Subtext is the engine of drama.", userId: charlie.id, likes: 35 },
      { content: "Can anyone recommend some good reading on warm dark matter models? Trying to understand the alternatives to standard cold dark matter.", userId: reader.id, likes: 3 },
      { content: "Heading to the observatory tonight to capture some images of the Sombrero Galaxy. Will post updates!", userId: alice.id, likes: 42 },
    ],
  });

  console.log("Notes seeded.");
  console.log("Seeding complete! Admin passwords are 'password123'");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
