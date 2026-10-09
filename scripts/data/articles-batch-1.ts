/**
 * Journal articles, batch 1 (English). Written for people in the UAE who search for the things below; each one links
 * to the matching breed pages. Published one per day from 2026-10-06 by `npm run articles:add`.
 * Keep the advice general and cautious: the owner's vet and the official rules always come first.
 */
export type ArticleDraft = {
  slug: string;
  title: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  /** Slug of the breed whose photo is used as the article's cover picture. */
  cover: string;
  body: string;
};

const WA = `<p><strong>Got a question about a puppy or a breed?</strong> Tap the WhatsApp button on this page — we reply to every single message, usually within minutes. We deliver across all seven emirates.</p>`;

export const batch1: ArticleDraft[] = [
  {
    slug: "how-much-does-a-puppy-cost-in-dubai-and-the-uae",
    title: "How Much Does a Puppy Cost in Dubai and the UAE? A Clear Price Guide",
    excerpt: "What really decides the price of a puppy in the UAE, what should be included, and what the usual price ranges are for popular breeds.",
    seoTitle: "How Much Does a Puppy Cost in Dubai & the UAE? Price Guide",
    seoDescription: "Puppy prices in Dubai and the UAE explained: what affects the price, what a fair price includes, and typical ranges for popular breeds in AED.",
    cover: "golden-retriever-puppies-english-cream-double-coat",
    body: `
<p>I get asked this question probably ten times a day. Someone sends us a message on WhatsApp — "how much for a Golden Retriever?" — and honestly, the answer is never as simple as throwing out a number. Puppy prices in the UAE range from a couple thousand dirhams to well over twenty thousand, and the gap isn't random. There are real reasons behind it.</p>

<p>I've been in the puppy business in the UAE for years now, and I've seen pricing from every angle — local breeding, imports from Europe, scam sellers on Instagram, the works. Let me walk you through what actually drives the cost so that next time you see a listing for puppies for sale in the UAE, you'll know whether you're looking at a fair deal or whether something's off.</p>

<h2>What makes one puppy more expensive than another</h2>
<p>It comes down to about five things, but each one has layers people don't think about.</p>

<p><strong>The breed itself.</strong> A <a href="/product/maltese-puppies/">Maltese</a> or a <a href="/product/shih-tzu-puppies/">Shih Tzu</a> — there are quite a few available in the UAE at any given time because local breeders produce them regularly. A Bernese Mountain Dog, a Samoyed, or an Ibizan Hound? Those almost always need to be imported from Europe or beyond, and importing adds thousands to the price. When you buy a puppy in Dubai, a big part of what you're paying for is availability. Supply and demand — it's that simple.</p>

<p><strong>Where the puppy comes from.</strong> An imported puppy means health certificates, flights, airline-approved crates, import permits from Dubai Municipality or ADAFSA (that's Abu Dhabi's authority), quarantine protocols, and sometimes customs clearance fees. All of that adds AED 3,000 to AED 7,000 on top of the puppy's base price. A puppy born locally skips most of that. But — and this matters — local doesn't automatically mean cheaper. A well-bred local puppy from health-tested parents can cost more than a hastily imported one.</p>

<p><strong>Size and coat.</strong> Toy and mini sizes command a premium because fewer puppies in a litter end up that small. If you're looking at teacup Pomeranians or mini Yorkies, expect to pay significantly more than for standard-sized versions. Same goes for unusual coat colours — a chocolate Labrador costs more than a black one in most markets, an English Cream Golden Retriever costs more than a standard gold, and merle-patterned dogs carry a hefty premium. Fewer are born, more people want them, prices go up.</p>

<p><strong>Health documentation.</strong> A puppy with proper vaccinations (DHPP series plus rabies), a registered microchip, a vet certificate, a real vaccination booklet with stamps, and deworming records costs more to prepare — but that extra cost saves you money down the line. I've watched people spend AED 2,000 "saving" on a puppy with no paperwork, then spend AED 5,000 at the vet within the first month treating parvovirus. Trust me on this one — skipping proper documentation always costs more later.</p>

<p><strong>Age and socialisation.</strong> A properly weaned puppy (eight weeks or older) that's been vet-checked, microchipped, vaccinated on schedule, and socialised with people and other dogs costs more to raise. Every week a breeder keeps a puppy means food, vet checkups, space, and care. A puppy pulled from its mother at four or five weeks? That's cheaper for the seller — and a disaster waiting to happen for the buyer.</p>

<h2>What you should expect to pay right now</h2>
<p>These are ballpark figures as of late 2026. I want to be transparent: prices shift with the season. Everyone wants a puppy in October and November when the weather cools down and families settle back after summer travel. January through March is another peak — new year, new puppy. Prices dip a bit in summer because fewer people are in the country and outdoor time with a puppy is limited. Treat these as a guide, not gospel:</p>
<ul>
<li><a href="/product/maltese-puppies/">Maltese</a> and <a href="/product/shih-tzu-puppies/">Shih Tzu</a> — starting around AED 6,000 for a standard-size puppy with full documentation</li>
<li><a href="/product/golden-retriever-puppies-english-cream-double-coat/">Golden Retriever</a>, <a href="/product/black-labrador-puppies/">Labrador</a>, <a href="/product/pug-puppies/">Pug</a> — roughly AED 8,000, though English Cream Goldens trend higher</li>
<li><a href="/product/white-pomeranian-puppies/">Pomeranian</a> and <a href="/product/apricot-chocolate-red-toy-poodle/">Toy Poodle</a> — around AED 9,000 to AED 12,000, depending on size and coat colour</li>
<li><a href="/product/york-shire-puppies/">Yorkshire Terrier</a> — AED 7,000 to AED 10,000, with minis and teacups at the higher end</li>
<li><a href="/product/cavapoo-puppies/">Cavapoo</a> — about AED 11,000 to AED 14,000; they've become extremely popular in Dubai Marina and JBR</li>
<li><a href="/product/english-bulldog/">English Bulldog</a> — AED 12,000 to AED 18,000, reflecting the breed's difficult (and expensive) breeding process</li>
<li><a href="/product/huskey/">Husky</a> — AED 8,000 to AED 12,000, though I always have a long conversation about heat with anyone looking at this breed</li>
<li>Rare or imported breeds (Bernese, Samoyed, rare-colour Frenchies) — AED 20,000 and up, sometimes well over AED 30,000</li>
</ul>
<p>Check our <a href="/puppies/">available puppies</a> and <a href="/importing/">importing page</a> for current prices in dirhams.</p>

<h2>Hidden costs most buyers forget about</h2>
<p>The puppy price is what you pay on day one. Here's what comes after — and people are consistently surprised by these:</p>
<ul>
<li><strong>Dubai Municipality registration:</strong> AED 150 to AED 250 depending on the emirate. Mandatory. You need it to get a pet travel permit later too.</li>
<li><strong>Remaining vaccinations and boosters:</strong> Your puppy won't be fully vaccinated when you get it. Expect two to three more vet visits at AED 200 to AED 400 each.</li>
<li><strong>Spaying or neutering:</strong> AED 800 to AED 2,000 depending on the breed, size, and clinic. Clinics like Modern Vet, Canadian Veterinary Clinic, and German Veterinary Clinic in Dubai all price this differently.</li>
<li><strong>Quality food:</strong> A decent brand — Royal Canin, Hill's Science Diet, Orijen — runs AED 200 to AED 500 a month depending on the dog's size. Don't cheap out on food. You'll pay for it in vet bills later.</li>
<li><strong>Grooming:</strong> Monthly for long-coated breeds. AED 150 to AED 300 per session. Poodles, Maltese, Pomeranians — they need professional grooming regularly.</li>
<li><strong>Pet insurance:</strong> More people are getting it now. AED 1,500 to AED 4,000 a year. Not mandatory, but one emergency surgery can cost AED 10,000+, so it's worth considering.</li>
<li><strong>Crate, bed, bowls, leash, toys, training pads:</strong> AED 500 to AED 1,500 to get properly set up. PetZone and PetsDeli in Dubai have everything you need.</li>
</ul>

<h2>What should come with the puppy</h2>
<p>At minimum, you should get:</p>
<ul>
<li>A vaccination card with dates and the vet's stamp — not just someone's word</li>
<li>Deworming records</li>
<li>A registered microchip</li>
<li>A health certificate from a licensed vet</li>
<li>Clear information about delivery and any extra costs</li>
</ul>
<p>If any of these is missing and the seller can't explain why, that's your cue to walk away. I've seen too many people learn this lesson the hard way.</p>

<h2>Red flags when searching for puppies for sale in the UAE</h2>
<p>A price that seems too good to be true almost always is. I've watched listings pop up on Dubizzle offering "purebred" Golden Retrievers for AED 1,500 — that's not a bargain, that's a warning sign. Watch out for sellers who won't show you the puppy on a video call, can't produce any paperwork, are vague about where the puppy came from, or push you to send a deposit before you've seen anything. Sellers who have twenty different breeds all available immediately, all suspiciously cheap, all from unnamed sources — run. There's no rush. A good seller will give you the time you need, answer every question, and show you everything.</p>

<p>Also be cautious with social media sellers who only have an Instagram page and no physical presence. That doesn't mean they're all scammers, but do extra due diligence. Ask for video calls. Ask to visit. Ask for references from previous buyers.</p>

<h2>Don't forget the costs after day one</h2>
<p>The purchase price is just the beginning. Over a dog's lifetime (10 to 15 years for most breeds), you're looking at AED 50,000 to AED 100,000 in total costs — food, vet care, grooming, boarding when you travel, and the occasional emergency. A well-documented puppy from a seller who does things properly almost always costs less over the dog's lifetime than a cheap one with hidden health problems. I've watched families spend AED 15,000 on emergency parvo treatment for a puppy they "saved" AED 3,000 on. It's not worth it.</p>

<p>If you're serious about getting the puppy price in Dubai right, invest in the puppy itself — buy from someone transparent, get full documentation, and budget for the first year honestly. You and your dog will both be better off for it.</p>
${WA}
`,
  },
  {
    slug: "best-dog-breeds-for-apartments-in-dubai-and-abu-dhabi",
    title: "The Best Dog Breeds for Apartments in Dubai and Abu Dhabi",
    excerpt: "Living in an apartment does not mean no dog. These breeds are calm, small enough and happy indoors, and how to look after them in the UAE heat.",
    seoTitle: "Best Dog Breeds for Apartments in Dubai & Abu Dhabi",
    seoDescription: "Small, calm dog breeds that suit apartment life in Dubai and Abu Dhabi: Maltese, Shih Tzu, Pomeranian, Cavapoo and more, with care tips for the heat.",
    cover: "maltese-puppies",
    body: `
<p>Here's the thing most people don't realise: dogs don't actually need a garden to be happy. What they need is the right temperament, the right amount of exercise, and an owner who makes time for them. We've placed hundreds of puppies in apartments across Dubai and Abu Dhabi — from studios in JLT to three-bedrooms in Al Reem Island, from one-beds in Dubai Marina to family flats in JVC — and the dogs are thriving. Seriously thriving.</p>

<p>That said, breed matters. You can't put a Border Collie in a one-bedroom flat and expect it to go well. And you can't ignore the heat either — we live in a place where outdoor time is seriously limited for about five months of the year. You need a dog that can adapt to indoor life without going stir-crazy.</p>

<p>I've spent years matching puppies to apartment owners, and some breeds come up again and again as perfect fits. Here are the ones I consistently see doing great, along with a few that don't work and some tips for making apartment life work no matter what breed you choose.</p>

<h2>What to look for in an apartment dog</h2>
<p>Not every small dog is automatically an apartment dog. A Jack Russell is small — it's also a ball of nuclear energy that'll shred your sofa if it doesn't get two hours of exercise daily. You want a breed that hits these marks:</p>
<ul>
<li>Moderate to low energy — not bouncing off the walls at 11pm</li>
<li>Doesn't bark at every footstep in the corridor (your neighbours in that Dubai Marina tower will thank you)</li>
<li>Has a manageable coat — grooming needs you can actually keep up with</li>
<li>Genuinely enjoys being around people, because in an apartment, you're always around each other</li>
<li>Handles heat reasonably well, or at least doesn't need hours of outdoor exercise to stay sane</li>
</ul>
<p>Size helps too — carrying a 2kg Maltese in the lift is a lot easier than wrestling a 30kg Labrador past your neighbours and their shopping bags.</p>

<h2>Breeds that work well</h2>

<h3>Maltese</h3>
<p>This is probably our most popular breed for apartment owners looking to buy a puppy in Dubai, and it's easy to see why. The <a href="/product/maltese-puppies/">Maltese</a> is gentle, playful, barely sheds, and is perfectly content with a short morning walk and some playtime at home. I've got clients in Business Bay living in 50-square-metre studios with a Maltese, and the dogs are completely content. The coat does need brushing — ideally every day, or at least every other day — but it's a small price for a dog this easy to live with. They're also hypoallergenic-ish (no dog is truly hypoallergenic, but Maltese come close), which matters in a sealed, air-conditioned apartment where allergens don't escape.</p>

<h3>Shih Tzu</h3>
<p>Calm and affectionate. The <a href="/product/shih-tzu-puppies/">Shih Tzu</a> was literally bred to be a companion — it sat on laps in Chinese palaces. It doesn't need long runs, doesn't demand constant attention, and it's happy just being near you while you work from home. I'd say the Shih Tzu is the best breed for someone who works remotely — it'll curl up under your desk for hours. Keep the coat trimmed short in summer (a "puppy cut" is what you want to ask your groomer for) and it's very low-maintenance. They're also naturally quiet dogs, which is a genuine advantage in apartment buildings.</p>

<h3>Pomeranian</h3>
<p>Small but full of character. The <a href="/product/white-pomeranian-puppies/">Pomeranian</a> thinks it's a big dog, which is both charming and occasionally a problem if you don't train it early. They can be barky — work on "quiet" from week one, and I mean week one, not "when it becomes a problem." But in terms of size and energy, they're great for flats. Two short walks and some indoor play is enough. Their fluffy coat needs regular brushing (three times a week minimum), and you'll want a professional groom every six to eight weeks. The one thing I always warn apartment owners about: Poms get attached to their person and can develop separation anxiety. If you're out of the flat ten hours a day, this might not be the breed for you.</p>

<h3>Cavapoo</h3>
<p>If you have kids, this is the one I'd point you toward. The <a href="/product/cavapoo-puppies/">Cavapoo</a> is friendly with everyone, gentle with children, smart enough to train easily, and has that soft, low-shedding coat that apartment dwellers love. It adapts to flat life without any drama. They're a Cavalier King Charles Spaniel crossed with a Poodle, so you get the Cavalier's sweetness and the Poodle's intelligence in one package. They need moderate exercise — a good walk morning and evening, maybe 30 minutes total — but they don't need to run marathons. The Cavapoo has become hugely popular in Dubai's family communities like Arabian Ranches and Jumeirah, and I've seen them do just as well in apartments.</p>

<h3>Toy Poodle</h3>
<p>Don't let the fancy haircuts fool you — <a href="/product/apricot-chocolate-red-toy-poodle/">Toy Poodles</a> are incredibly smart and easy to train. They're actually one of the most intelligent dog breeds in the world, period. They barely shed, they're compact (under 4kg typically), and they pick up on your routines quickly. Great for first-time owners who want a dog that's eager to learn. Toy Poodles are also long-lived — 14 to 16 years isn't unusual — so you're making a real commitment. For apartment life, they're nearly perfect. Just make sure they get enough mental stimulation. A bored Poodle gets creative, and not in ways you'll appreciate.</p>

<h3>Yorkshire Terrier</h3>
<p>Tiny, brave, and surprisingly loyal. The <a href="/product/york-shire-puppies/">Yorkie</a> bonds hard with its family and doesn't need much space. At 2 to 3kg, they're genuinely portable — you can take them everywhere in a carrier bag, and plenty of Dubai's pet-friendly cafes and malls welcome them. Just be aware they can develop a barking habit if you don't set boundaries early. A Yorkie that barks at every delivery driver will make you very unpopular on your floor. Invest time in training and you'll have a fantastic flat dog. Their silky coat needs regular grooming — either keep it trimmed short or commit to daily brushing.</p>

<h3>Pug</h3>
<p>The <a href="/product/pug-puppies/">Pug</a> deserves a mention because they're so popular in Dubai apartments. They're compact, hilarious, and love lounging around. But a genuine caution: Pugs are flat-faced, and the UAE heat is hard on them. They overheat fast and can't do long walks even in winter. AC is non-negotiable, and summer walks need to be extremely short. If you're a homebody who keeps the flat cool, a Pug can be an amazing companion.</p>

<h2>Breeds that struggle in apartments</h2>
<p>A <a href="/product/huskey/">Husky</a> in a Dubai apartment is a recipe for frustration — for you and the dog. I've seen it too many times. They're gorgeous, I get it. But a Husky needs hours of physical and mental exercise every day, it sheds enough fur to build a second dog every week, and it'll howl when it's bored — which in a JLT apartment means noise complaints within the first month. Same goes for Alaskan Malamutes, Border Collies, and Belgian Malinois. German Shepherds are borderline — they can work in a large apartment with a very committed owner, but most apartment situations aren't right for them. If you love big, active breeds, be honest with yourself about whether your lifestyle can support one in a hot climate with limited outdoor time.</p>

<h2>Know your building's pet policy</h2>
<p>Before you fall in love with a puppy, check your building's rules. Most newer buildings in Dubai Marina, Downtown, JLT, and Business Bay allow small to medium dogs, but there are conditions: weight limits (often 15kg or 25kg), breed restrictions, service lift requirements, and designated pet relief areas. Older buildings in Deira, Bur Dubai, and parts of Sharjah can be stricter — some ban pets entirely. If you're renting, check your tenancy contract too. In Abu Dhabi, buildings on Al Reem Island, Saadiyat, and Al Raha Beach are generally pet-friendly, but always confirm with building management in writing before you commit.</p>

<h2>Practical tips for apartment dogs in the UAE</h2>
<ul>
<li>Walk before 8am and after 7pm in summer. The pavement at midday can burn paws in seconds — I've seen it happen, and it's heartbreaking.</li>
<li>Puzzle feeders, snuffle mats, and short training sessions give mental exercise when it's too hot to go out. A ten-minute training session tires a puppy out more than a 30-minute walk.</li>
<li>Set up a cool spot with water and a bed — not directly under the AC vent, but in a naturally cool area of the flat.</li>
<li>Invest in a good enzyme-based cleaner for accidents. Puppies will have them, and regular cleaners don't fully remove the scent.</li>
<li>Teach "quiet" early. Your neighbours on floors 14 through 18 will thank you.</li>
<li>Consider a puppy playdate group — there are WhatsApp groups for dog owners in most Dubai communities. Socialisation matters, especially for apartment dogs that don't naturally encounter other dogs as often.</li>
<li>If you work in an office, think about a dog walker or a doggy daycare. Puppies shouldn't be alone for eight-plus hours.</li>
</ul>
<p>Not sure which breed fits your place? Have a look at the <a href="/puppies/">available puppies</a> or just ask us — we match people to the right breed every single day, and we'll help you find the right one for your apartment, your schedule, and your family.</p>
${WA}
`,
  },
  {
    slug: "puppy-vaccination-schedule-in-the-uae-what-to-give-and-when",
    title: "Puppy Vaccination Schedule in the UAE: What to Give and When",
    excerpt: "A simple guide to the first year of vaccinations, deworming and microchipping for a puppy in the UAE, and why your vet always has the last word.",
    seoTitle: "Puppy Vaccination Schedule in the UAE: What & When",
    seoDescription: "A clear puppy vaccination and deworming schedule for the UAE: core vaccines, boosters, rabies and microchip, with tips for keeping your puppy safe.",
    cover: "german-shepherd-puppies",
    body: `
<p>Vaccinations are one of those things where there's really no shortcut. A puppy without its full course of vaccines is at risk for diseases that are preventable, serious, and sometimes fatal. I know the schedule can seem confusing — there are boosters, different brands, different protocols, conflicting advice online, and your friend's cousin who says their dog "never got vaccinated and is fine." Don't listen to that cousin. Here's the straightforward version from someone who deals with puppy health documentation every single day.</p>

<p>One caveat before we start: your vet decides the exact timing. Every puppy is slightly different, and the vet will adjust based on the puppy's health, breed, weight, and history. Clinics like Modern Vet in Dubai, British Veterinary Hospital, Canadian Veterinary Clinic, and German Veterinary Clinic all follow the same core protocol but might vary on the edges. Use this as a general map, not a prescription.</p>

<h2>Why vaccines matter — especially in the UAE</h2>
<p>Newborn puppies get some immunity from their mother's milk (colostrum), but it fades fast — usually between six and sixteen weeks. Without vaccines during that window, they're vulnerable to distemper, parvovirus, hepatitis, leptospirosis, and other nasty diseases. Parvovirus in particular is something we hear about too often in the UAE. It spreads through contaminated faeces and can survive on surfaces — pavements, shoes, park benches — for months. It's brutal on unvaccinated puppies, and treatment is expensive (we're talking AED 5,000 to AED 10,000 in ICU care with no guarantee of survival).</p>

<p>I've seen perfectly healthy-looking eight-week-old puppies go downhill in 24 hours from parvo. Every single case I've witnessed was preventable with proper vaccination. It's not something I'll ever stop being passionate about.</p>

<p>Until the full course is done, be careful about where your puppy goes. Dog parks, pet shops, busy walkways outside Dubai Marina Mall, the grassy patches in JLT — these are all places where an unvaccinated puppy can pick something up. Your vet will tell you when it's safe to venture out. In the meantime, socialise at home with people and known vaccinated dogs.</p>

<h2>The typical vaccination schedule</h2>

<h3>6 to 8 weeks: First combined vaccine (DHPP)</h3>
<p>This is the big one — your puppy's first real defence. DHPP stands for Distemper, Hepatitis, Parainfluenza, and Parvovirus. Some vets use a vaccine called Nobivac DHPPi (the "i" is for infectious canine hepatitis), others use Vanguard Plus 5. The brand matters less than the timing. This vaccine primes the immune system — think of it as setting the foundation. It doesn't give full protection yet; that's why there are boosters.</p>

<h3>10 to 12 weeks: Second dose (DHPP booster)</h3>
<p>Same core vaccine, second dose. This boosts the immune response and starts building real protection. Some vets also add Leptospirosis at this stage — that's a bacteria spread through contaminated water, and it's relevant in the UAE because irrigation water and puddles after rare rain can harbour it. Your vet might also discuss Kennel Cough (Bordetella) vaccination, especially if you plan to use doggy daycare or boarding — most facilities require it.</p>

<h3>14 to 16 weeks: Third dose (DHPP booster)</h3>
<p>This completes the initial puppy course. After this, your puppy is considered "fully vaccinated" for the core diseases — though the rabies vaccine is a separate conversation. Most vets wait until this appointment to give you the green light for dog parks and public spaces. Until this third dose has been given and two weeks have passed, keep your puppy away from unvaccinated dogs and high-traffic outdoor areas.</p>

<h3>Around 12 to 16 weeks: Rabies vaccine</h3>
<p>Rabies vaccination timing depends on your vet and the local authority's requirements. Dubai Municipality requires rabies vaccination for all dogs. ADAFSA in Abu Dhabi has the same requirement. Most vets give it at 12 weeks, but some wait until 16 weeks. It's a single shot, and then a booster at one year. After that, boosters are typically every one to three years depending on the vaccine brand used. This is non-negotiable in the UAE — you need the rabies certificate for municipality registration, for import permits, for travel, and for your dog's official file.</p>

<h3>One year: Annual booster</h3>
<p>A combined booster (DHPP) and rabies, if due. After this, your vet will recommend a schedule — usually annual boosters for the combined vaccine and rabies as per the certificate timeline. Some modern protocols allow triennial (every three years) core boosters, but discuss this with your vet rather than making the call yourself.</p>

<h2>Vaccination costs in the UAE</h2>
<p>This varies by clinic and emirate, but here's a rough idea:</p>
<ul>
<li>Each DHPP vaccine dose: AED 150 to AED 300</li>
<li>Rabies vaccine: AED 100 to AED 200</li>
<li>Kennel Cough (Bordetella): AED 150 to AED 250</li>
<li>General vet consultation fee: AED 100 to AED 250 per visit</li>
</ul>
<p>So the full puppy vaccination course, including all vet visits, typically costs AED 1,000 to AED 2,000 total. It sounds like a lot — until you compare it to AED 8,000 for parvo treatment. Prevention is always cheaper than cure.</p>

<h2>Deworming</h2>
<p>Puppies pick up intestinal worms easily — from their mother, from the environment, from sniffing the wrong patch of grass. Deworming starts early, and the schedule is tighter than most people expect:</p>
<ul>
<li>Every two weeks from 2 weeks to 12 weeks old</li>
<li>Monthly from 3 months to 6 months</li>
<li>Every three months after that, for life</li>
</ul>
<p>Your vet will prescribe a dewormer — common ones include Drontal and Milbemax. Follow the dosing by weight, not by guesswork. Your vet will also recommend flea and tick prevention — Frontline, NexGard, or Bravecto are the brands you'll see most in UAE vet clinics. Ask which products are safe for your puppy's age and weight, because not all of them are — some flea treatments are toxic to puppies under a certain age or weight. Never use a product meant for a different size dog.</p>

<h2>The microchip</h2>
<p>A microchip is a tiny implant (about the size of a grain of rice) injected between the shoulder blades. It carries a unique ID number linked to your details in a database. If your dog ever gets lost — and in Dubai, with doors opening to corridors and lifts, it happens more often than you'd think — any vet or shelter can scan the chip and find your contact details. The procedure takes seconds and causes minimal discomfort. Most puppies don't even flinch.</p>

<p>Make sure the microchip is registered in your name with your current phone number and address. The chip itself is useless if nobody knows who it belongs to. Update your details if you move or change numbers. In the UAE, the microchip number is also what links to your municipality registration.</p>

<h2>What papers should you have</h2>
<p>When you pick up your puppy, you should walk away with:</p>
<ul>
<li>A vaccination card with dates, vaccine names (not just "vaccine 1"), batch numbers, and a vet's stamp</li>
<li>Deworming records with dates and product names</li>
<li>A microchip number — you should be able to scan and verify it</li>
<li>A health certificate from a licensed vet, ideally issued within the last few days</li>
</ul>
<p>Every puppy from Puppyfy comes with all of this, and we walk you through what comes next — including booking your next vet appointment and registering with your municipality. More details on our <a href="/faqs/">FAQ page</a>.</p>

<h2>When to call the vet immediately</h2>
<p>Don't wait it out if you see any of these signs: vomiting (especially if repeated), bloody diarrhoea, refusal to eat for more than a day, extreme lethargy (a puppy that won't get up or play), persistent coughing, nasal discharge, or a high temperature. Young puppies go downhill fast — much faster than adult dogs. A few hours can make the difference between a treatable illness and a tragedy.</p>

<p>Better to make one unnecessary vet visit than to wait too long. Most UAE vet clinics have emergency hours, and several — like British Veterinary Hospital in Dubai and Abu Dhabi Falcon Hospital (which also sees dogs) — offer 24-hour emergency services. Save your vet's emergency number in your phone the day you bring your puppy home. You probably won't need it, but if you do, you won't be scrambling to find it at midnight.</p>
${WA}
`,
  },
  {
    slug: "how-to-import-a-puppy-to-the-uae-documents-and-steps",
    title: "How to Import a Puppy to the UAE: Documents and Steps Explained",
    excerpt: "What bringing a puppy into the UAE usually involves: health certificate, microchip, vaccinations, permit and delivery, and why to use someone who does it every week.",
    seoTitle: "How to Import a Puppy to the UAE: Documents & Steps",
    seoDescription: "Importing a puppy to the UAE explained: the usual documents, microchip, vaccinations, health certificate and permit, and how Puppyfy handles it for you.",
    cover: "bernese-mountain-puppies-for-importing-from-best-kennel-in-the-world",
    body: `
<p>Not every breed is available locally. If you've got your heart set on a Bernese Mountain Dog, a Samoyed, a Cane Corso, or a rare-colour Border Collie, chances are your puppy is coming from abroad. We do this every single week — we import puppies from breeders across Europe and beyond — so it feels routine to us. But I know for first-time buyers who just want to buy a puppy in Dubai that happens to be an uncommon breed, the whole import process can seem overwhelming.</p>

<p>Here's how it actually works, step by step. I want to be transparent: the specifics can change, because authorities update their rules periodically, airline policies shift, and each emirate's import authority has its own quirks. Always double-check the latest requirements before committing — or better yet, work with someone who does this regularly so you don't have to track every update yourself.</p>

<h2>Finding the right breeder</h2>
<p>This is the step that matters most, and it's the one people rush through because they're excited. I get it — you've found your dream breed, you want the puppy now. But slow down.</p>

<p>A registered breeder who raises puppies properly will: show you the parents' health records (including hip and elbow scores for larger breeds), let you see the puppy on video before you pay, provide FCI or kennel club registration papers, and give you a clear timeline. They'll also answer your questions without getting defensive. We've built relationships with breeders in countries like Hungary, Poland, the Czech Republic, Italy, Serbia, and the UK over years. Some we've visited in person. The difference between a reputable breeder and a puppy mill is the difference between a healthy dog and a heartbreak — and I've seen enough heartbreaks to be very firm about this.</p>

<p>Be especially cautious about breeders you find on Instagram or Facebook who ship internationally but won't provide verifiable references. Ask for contact details of previous buyers. A good breeder is proud of their reputation and happy to prove it.</p>

<h2>Health checks and vaccinations before the flight</h2>
<p>Before the puppy can fly, it needs to be:</p>
<ul>
<li><strong>Vaccinated:</strong> The full DHPP (distemper, hepatitis, parainfluenza, parvovirus) series, administered on schedule. Rabies vaccination is mandatory and must be given at least 21 days before travel — this is a hard rule that no one can waive.</li>
<li><strong>Microchipped:</strong> With an ISO-compliant 15-digit chip. The chip must be implanted before the rabies vaccine is administered — if it's done after, the rabies vaccine is technically invalid for travel purposes, and you'll need to redo it and wait another 21 days.</li>
<li><strong>Dewormed:</strong> Internal and external parasite treatment within a specific window before travel — usually within five days of departure.</li>
<li><strong>Vet-examined:</strong> A licensed veterinarian examines the puppy and issues an official health certificate. In Europe, this is the EU pet passport or a third-country veterinary certificate. Every document needs to match the microchip number exactly — one digit off and you're looking at delays at the airport. I've seen shipments held up for three days over a transposed number. It's that serious.</li>
</ul>

<h2>Country-specific requirements</h2>
<p>Not every country has the same process, and some add extra steps:</p>
<ul>
<li><strong>EU countries (Germany, France, Italy, etc.):</strong> The EU pet passport system makes things relatively smooth. The passport contains vaccination records, microchip details, and vet certifications in a standardised format. The health certificate typically needs to be endorsed by the country's official veterinary authority — in Germany that's the Veterinaramt, in Italy it's the ASL.</li>
<li><strong>UK:</strong> Post-Brexit, the UK has its own export rules. You'll need an Animal Health Certificate issued by an Official Veterinarian (OV), and it's valid for only 10 days for the journey. Timing is tight.</li>
<li><strong>Eastern Europe (Hungary, Poland, Czech Republic, Serbia):</strong> These are popular sourcing countries for many breeds. The process is straightforward but requires legalised health certificates, and not all breeders are familiar with UAE import requirements specifically. That's where having an experienced importer matters — we know what each country's vets need to provide.</li>
<li><strong>Russia and CIS countries:</strong> Additional legalisation steps may be required, and some airline routes have longer layovers that add stress to the journey. We plan routes carefully.</li>
<li><strong>USA:</strong> USDA-endorsed health certificates, and recently stricter rules around rabies documentation. Direct flights from most US cities to the UAE exist (Emirates, Etihad), which is good for minimising travel time.</li>
</ul>

<h2>The import permit</h2>
<p>You need an import permit from the relevant UAE authority before the puppy flies. For Dubai, that's Dubai Municipality. For Abu Dhabi, it's ADAFSA (Abu Dhabi Agriculture and Food Safety Authority). For Sharjah, Ajman, RAK, Fujairah, and UAQ, it's the Ministry of Climate Change and Environment (MOCCAE) or the respective municipality.</p>

<p>The application requires the health documentation, the microchip details, vaccination records, and breed information. This is also where mistakes happen most often — incorrect breed names (the breed name on the permit must match the health certificate exactly), mismatched microchip numbers, missing stamps, or uploading the wrong document. The permit typically takes three to five working days to process, sometimes faster, sometimes slower. If you haven't done it before, it's easy to get tripped up. We've streamlined this into a checklist after years of doing it.</p>

<h2>The flight</h2>
<p>The puppy travels on an approved airline in an IATA-compliant crate — that means the crate must be the right size for the breed (the puppy needs to stand, turn around, and lie down comfortably), with proper ventilation, a leak-proof bottom, and secure fastening. The crate needs a water dish attached to the door and a "Live Animal" label.</p>

<p>Airlines we commonly use include Emirates SkyCargo, Etihad Cargo, Lufthansa Cargo, and Turkish Airlines Cargo. Each has different policies on breed restrictions (some won't fly snub-nosed breeds in cargo), crate sizes, and seasonal embargoes. Very small puppies sometimes qualify for cabin transport as accompanied baggage on certain airlines, but this requires a human courier on the same flight.</p>

<p>We always choose airlines and routes that minimise travel time. A direct flight from Budapest to Dubai is about five hours — perfectly manageable. We avoid multi-stop routes and layovers in airports with poor animal handling facilities. And we don't ship during the peak of summer — June through August in particular — because tarmac temperatures at departure airports in Southern Europe can hit 45 degrees Celsius, and even the climate-controlled cargo hold isn't loading until the plane is at the gate. The ground transfer is the risky part.</p>

<h2>Timeline expectations</h2>
<p>From the moment you commit to a puppy to the day it arrives at your door, here's a realistic timeline:</p>
<ul>
<li><strong>Weeks 1-2:</strong> Selecting the puppy, agreeing on terms, initiating health documentation</li>
<li><strong>Weeks 2-4:</strong> Vaccinations completed (if not already done), rabies administered, 21-day waiting period begins</li>
<li><strong>Week 4-5:</strong> Import permit application, flight booking, final vet examination, health certificate issued</li>
<li><strong>Week 5-6:</strong> Flight day, airport clearance, delivery to your door</li>
</ul>
<p>Total: roughly four to six weeks. Can it be faster? Sometimes, if the puppy is already fully vaccinated and the rabies waiting period has passed. Can it take longer? Yes — holidays, permit delays, or airline schedule changes can push it out. Patience pays off here.</p>

<h2>Arrival and delivery</h2>
<p>At the airport, the documents are checked against the microchip. The puppy is scanned, the paperwork is reviewed, and assuming everything matches (and it should, if the paperwork was done properly), the puppy is cleared and released. We handle the airport pickup ourselves and deliver to your door — anywhere in the UAE, from Fujairah to Abu Dhabi to RAK.</p>

<h2>Common problems and how to avoid them</h2>
<ul>
<li><strong>Document errors</strong> — the microchip number on the health cert doesn't match the vaccination card. Triple-check everything before the flight. One wrong digit means the puppy can be held at the airport.</li>
<li><strong>Age restrictions</strong> — there are minimum ages for travel. A puppy that's too young won't be cleared. Most airlines require a minimum of 10 to 12 weeks.</li>
<li><strong>Summer heat</strong> — some airlines suspend live animal transport during July and August. Plan accordingly — if you want a puppy for September, start the process in June.</li>
<li><strong>Scam sellers abroad</strong> — never send money to someone who can't show you the actual puppy on a live video call, the actual papers, and the actual breeder details. We've heard of people sending AED 15,000 to "breeders" who turned out to be stock-photo operations.</li>
<li><strong>Breed-specific restrictions</strong> — some emirates have restrictions on certain breeds. Verify that your breed is allowed before you start the process.</li>
</ul>

<h2>Why use someone who does this regularly</h2>
<p>We bring puppies into the UAE every week. We know which airlines are reliable, which routes work, how to fill out the paperwork so it clears on the first pass, which breeders actually deliver what they promise, and how to handle the inevitable curveball (flight cancelled, document query, permit delay). You pick the breed you love — we handle everything else, including the stress. See what's available on the <a href="/importing/">importing page</a>, or tell us exactly what you're looking for and we'll find it.</p>
${WA}
`,
  },
  {
    slug: "keeping-your-puppy-safe-in-the-uae-summer-heat",
    title: "Keeping Your Puppy Safe in the UAE Summer Heat",
    excerpt: "Hot pavements, midday sun and humidity are dangerous for puppies. Practical rules for walks, water, cars and the signs of heatstroke.",
    seoTitle: "Puppy Heat Safety in the UAE Summer: Walks & Heatstroke",
    seoDescription: "How to keep a puppy safe in the UAE summer: when to walk, hot pavement test, water, cars, the breeds most at risk and the signs of heatstroke.",
    cover: "pug-puppies",
    body: `
<p>If you've lived in Dubai or Abu Dhabi through July and August, you already know. The kind of heat that hits you like a wall the moment you step outside. Air temperature 42 to 48 degrees Celsius, humidity pushing 80 to 90 percent, and ground temperature? I've measured pavement in Dubai Marina at 65 degrees Celsius at 2pm. Now imagine walking on that with bare feet. That's what your dog is dealing with — plus a fur coat and no ability to sweat.</p>

<p>Dogs cool down mainly by panting, and panting doesn't work well when the humidity is 80%. Their bodies simply can't shed heat fast enough. Puppies, flat-faced breeds, thick-coated dogs, and senior dogs are especially vulnerable. Every summer we hear stories of dogs suffering heatstroke, burned paw pads, and dehydration — and nearly all of them were preventable with basic precautions.</p>

<p>I've lived in the UAE for years and raised dogs here the entire time. Here's everything I've learned about keeping puppies safe when the temperature wants to cook everything in sight.</p>

<h2>The walk schedule — this is non-negotiable</h2>
<p>This is the single most important rule: walk early, walk late. Before 7:30am and after 7pm in summer. The middle of the day is off limits, full stop. Even at 6pm the pavement can still be scorching — the concrete and asphalt absorb heat all day and radiate it back for hours after the sun starts to dip.</p>

<p>If it's one of those days where it's still 42 degrees at sunset — and in July, that happens — skip the walk entirely and play indoors instead. Use the corridor for a quick toilet break (training pads are your friend) and save the proper walk for early morning. Your puppy won't hold it against you. I promise. A missed walk is infinitely better than heatstroke.</p>

<p>I've seen people walking their dogs at 3pm in August in Dubai Marina because "the dog needs exercise." That's not exercise — that's a medical emergency waiting to happen. Adjust your schedule, not your dog's safety.</p>

<h2>The pavement test</h2>
<p>Press the back of your hand flat on the pavement for seven seconds. If you can't hold it there, your dog can't walk on it. It's that simple. Paw pads burn, and it happens faster than most people think — second-degree burns in under a minute on hot asphalt. Once burned, paw pads are painful, slow to heal, and prone to infection.</p>

<p>Stick to grass (which is cooler but still check it), shaded paths, or wait. Some people use dog booties — they work, but many dogs hate them and spend the walk trying to shake them off. If you can train your puppy to tolerate booties from a young age, great. If not, just avoid hot surfaces entirely. The grass strips along the corniche and in community parks are usually your best bet.</p>

<h2>Water — everywhere, always</h2>
<p>Carry a bottle and a collapsible bowl on every walk, even short ones. At home, keep water bowls in multiple spots and refill them through the day. Here's what people forget: the water in the bowl heats up. A bowl on your balcony in summer sun can reach 50 degrees Celsius by midday. That's not refreshment — that's soup. Change the water frequently, keep bowls in shaded indoor spots, and add an ice cube or two during peak heat.</p>

<p>If your puppy spends any time on the balcony, make sure there's shade and ventilation. But honestly, during summer in the UAE, it's better to keep them inside entirely. Balconies in direct sun become ovens. I've measured balcony floor tiles at over 55 degrees Celsius in JBR during July. Not safe for paws, not safe for a small body.</p>

<h2>Never, ever leave a dog in a car</h2>
<p>This shouldn't need saying, but it does — every summer. A parked car in the UAE sun becomes an oven in under five minutes. Even with the windows cracked, even in the shade, even if you're "just running in for a second." Interior temperatures can reach 70 degrees Celsius. Your dog's body temperature hits fatal levels in minutes. Not hours — minutes. Don't do it. Take the dog with you or leave it at home. There are no exceptions.</p>

<h2>Breeds that need extra caution in UAE summers</h2>
<ul>
<li><strong>Flat-faced (brachycephalic) breeds</strong> — <a href="/product/pug-puppies/">Pugs</a>, <a href="/product/english-bulldog/">English Bulldogs</a>, French Bulldogs, Boston Terriers. Their shortened airways make breathing in heat and humidity genuinely dangerous. These dogs can overheat just from excitement in a warm room, let alone outdoor exercise in July. If you own a flat-faced breed in the UAE, summer walks should be five minutes maximum, at the coolest time of day, and cancelled entirely if it feels too warm.</li>
<li><strong>Heavy-coated breeds</strong> — <a href="/product/huskey/">Huskies</a>, Malamutes, Chow Chows, Samoyeds, Bernese Mountain Dogs. They're built for cold climates — subarctic cold, not Arabian Gulf heat. In UAE summers they need air conditioning running all day, very limited outdoor time, and careful monitoring. I've spoken to Husky owners in Dubai who keep their AC at 18 degrees all summer. That's the level of commitment these breeds require here.</li>
<li><strong>Puppies under six months</strong> — their bodies regulate temperature less efficiently than adult dogs. They dehydrate faster, overheat quicker, and can't communicate their distress as clearly.</li>
<li><strong>Senior dogs and overweight dogs</strong> — both groups struggle with thermoregulation. Extra weight means extra insulation and extra effort to move.</li>
</ul>

<h2>Indoor activities for hot months</h2>
<p>Your dog still needs mental and physical stimulation when outdoor walks are limited. Here's what works:</p>
<ul>
<li><strong>Puzzle feeders and snuffle mats:</strong> Hide kibble in a snuffle mat or a Kong toy. Twenty minutes of sniffing and problem-solving tires a puppy out as much as a walk. You can get these at PetZone or PetsDeli in Dubai.</li>
<li><strong>Indoor training sessions:</strong> Five to ten minutes of "sit," "stay," "paw," and "come" practice burns mental energy efficiently. Puppies love learning when treats are involved.</li>
<li><strong>Tug-of-war and fetch:</strong> If you've got a hallway, you've got a fetch lane. Use a soft toy and keep sessions short so they don't overheat even indoors.</li>
<li><strong>Frozen treats:</strong> Freeze low-sodium chicken broth or plain yoghurt in a Kong. It's entertainment and cooling in one. Some people freeze banana slices or blueberries in ice cubes — dogs love them.</li>
<li><strong>Socialisation visits:</strong> Invite a friend with a vaccinated dog over for a playdate. Indoor socialisation is perfectly valid and keeps your puppy from getting bored.</li>
</ul>

<h2>Cooling products worth considering</h2>
<p>The pet industry has caught up with the UAE's needs. Cooling mats (gel-based, no electricity needed) work well — lay one in your dog's favourite spot and it draws heat away from their body. Cooling vests that you soak in water and put on the dog can help during early-morning walks. Elevated mesh beds promote airflow underneath the dog, which helps with cooling better than a padded bed on a warm floor. You'll find all of these at pet shops across Dubai — PetZone in Mall of the Emirates and Ibn Battuta usually stock them, as does PetsDeli.</p>

<h2>Heatstroke: know the signs, act immediately</h2>
<p>This is a genuine emergency. Heatstroke can kill a dog in under an hour if untreated. If you see any of these signs, act immediately:</p>
<ul>
<li>Heavy, loud panting that won't stop even after rest</li>
<li>Excessive drooling, thick or sticky saliva</li>
<li>Bright red or very pale gums</li>
<li>Wobbling, confusion, or loss of coordination</li>
<li>Vomiting or diarrhoea</li>
<li>Collapsing or inability to stand</li>
</ul>
<p>Move the dog to a cool, air-conditioned area immediately. Offer small sips of cool water — not ice water, which can cause the blood vessels to constrict and actually slow cooling. Wet the body with cool (not cold) water, especially the neck, armpits, and groin where major blood vessels are close to the surface. Don't submerge the dog in an ice bath — gradual cooling is safer. And call your vet right away. Every minute counts. Even if the dog seems to recover, internal organ damage can occur that isn't visible, so a vet visit is mandatory after any suspected heatstroke episode.</p>

<h2>Keeping cool at home</h2>
<p>Keep the AC running (most of us do anyway — this is the UAE), provide a cooling mat in a quiet corner, and make sure your dog isn't lying in direct sunlight streaming through windows. If you have a long-coated breed, ask your groomer about a summer trim — but never shave a double coat down to the skin. I know it seems logical in 45-degree heat, but a double coat actually insulates against heat and protects against sunburn. Shaving can cause permanent coat damage and patchy regrowth. A light tidy trim, thinning out the undercoat, and keeping the belly trimmed is fine — ask your groomer specifically about a "summer cut" that preserves the coat's structure.</p>

<p>The UAE summer is serious, but it's completely manageable with the right habits. Thousands of dogs live happy, healthy lives here year-round. The owners who do well are the ones who respect the heat instead of fighting it — adjust the schedule, keep the AC on, and save the outdoor adventures for October through April when the weather is genuinely beautiful for you and your dog.</p>
${WA}
`,
  },
  {
    slug: "golden-retriever-vs-labrador-which-puppy-is-right-for-your-family",
    title: "Golden Retriever vs Labrador: Which Puppy Is Right for Your Family?",
    excerpt: "Two of the friendliest family dogs, compared honestly: size, energy, grooming, training and how each copes with life in the UAE.",
    seoTitle: "Golden Retriever vs Labrador: Which Is Right for You?",
    seoDescription: "Golden Retriever or Labrador? Compare size, coat, energy, training and heat tolerance to choose the right family puppy in the UAE.",
    cover: "creamy-labradore-puppies",
    body: `
<p>This is one of those questions where there's no wrong answer — both breeds are fantastic. Golden Retrievers and Labradors are the two most popular family dogs in the world for a reason. They're friendly, patient, great with kids, and eager to please. I've placed both breeds with families across Dubai and Abu Dhabi — from villas in Arabian Ranches to apartments in Al Reem Island — and both can thrive in the UAE with the right care. But they're not identical, and the differences might matter depending on your situation, your home, and your lifestyle.</p>

<p>I've lived with both breeds over the years, and I've watched hundreds of families make this exact decision. Let me give you the honest, side-by-side comparison so you can figure out which one fits your family better.</p>

<h2>Size and build</h2>
<p><strong>Both are large dogs</strong> — expect 25 to 35kg as adults, with males on the heavier end. But they carry that weight differently. Labs tend to be a bit more compact, stocky, and muscular — think athletic and solid. A Lab looks like it should be fetching a stick on a beach. The Golden is slightly longer in body, leaner through the chest, and has that flowing feathered coat that gives it an elegant, regal look.</p>

<p>For apartment living in Dubai (which many families consider), both breeds are on the large side. It's doable — I know happy Labs in two-bed apartments in JLT — but you need to commit to daily exercise, rain or shine (well, heat or cool). If you're in a villa with a garden, like in Arabian Ranches, JVC, or Mirdif, both breeds will be noticeably happier with the extra space.</p>

<h2>The coat — this is where the practical difference shows up</h2>
<p>If I had to point to one difference that affects day-to-day life the most, it's the coat.</p>

<p>The <a href="/product/golden-retriever-puppies-english-cream-double-coat/">Golden Retriever</a> has a long, flowing double coat that's beautiful but demands regular maintenance — brushing three or four times a week minimum, and daily during shedding season (which in the UAE seems to last about nine months, honestly). Hair everywhere: on your clothes, on the sofa, floating through the AC vents, embedded in your car seats, tumbling across your tile floors like tiny golden tumbleweeds. Professional grooming every six to eight weeks is strongly recommended — expect AED 200 to AED 350 per session depending on the salon.</p>

<p>The <a href="/product/black-labrador-puppies/">Labrador</a> has a short, dense, water-resistant double coat that's much easier to manage day to day. A good brush once or twice a week usually suffices. Labs shed plenty too — don't let anyone tell you they don't — but the hair is shorter and less noticeable on furniture. Grooming costs are lower since they don't need as much professional attention. But here's the thing: nobody's winning a clean-house award with either breed. If you're the type who can't stand pet hair, neither of these is your dog. Look at a Poodle or a Maltese instead.</p>

<h2>Energy and exercise needs</h2>
<p>Both breeds need a solid hour of exercise daily. This is a real commitment in the UAE, where summer heat limits outdoor time to early morning and late evening. But the energy style is different.</p>

<p>Labs are often a bit more intense — more bouncy, more physically enthusiastic, more "let me jump on every visitor" as puppies. They're food-obsessed (I'll get to that), they're ball-obsessed, and they have an enthusiasm for life that borders on chaotic until about age two or three. A young Lab is a hurricane of love and energy. You need to be ready for that.</p>

<p>Goldens tend to be slightly calmer, slightly gentler in their energy. They're still active, still playful, still need that daily exercise — but they're less likely to knock your three-year-old over from sheer excitement. They also mature a bit more gracefully. A two-year-old Golden is noticeably calmer than a two-year-old Lab, in my experience.</p>

<p>Both breeds love swimming, which is great in the UAE — there are a few dog-friendly beaches and pools. Swimming is fantastic exercise that doesn't stress their joints and keeps them cool. If you have access to a pool or beach, both breeds will be in heaven.</p>

<h2>Personality and temperament</h2>
<p>Goldens are sensitive. They read your mood, they want to be near you, they're empathetic in a way that's almost uncanny. A Golden will notice you're sad before your spouse does. This sensitivity makes them wonderful therapy dogs and emotional companions, but it also means they don't handle harsh training or loud environments well. They take corrections to heart — sometimes too much.</p>

<p>Labs are more like your goofy best friend — cheerful, boisterous, up for anything, resilient to chaos. A Lab in a house with three kids and a cat will just roll with it. They're thick-skinned emotionally (though obviously still sensitive to mistreatment). They bounce back quickly from setbacks. This makes them slightly easier to live with in a busy, noisy household.</p>

<p>Both are incredibly loving, just in slightly different ways. A Golden loves you thoughtfully. A Lab loves you enthusiastically.</p>

<h2>Training</h2>
<p>Both are among the easiest breeds to train — they're in the top ten for intelligence and the top five for eagerness to please. A Lab's food motivation makes treat training almost laughably easy — hold a treat and you can teach a Lab to do just about anything. But that food obsession also means Labs will eat anything they find on the ground, in the bin, on the counter, in your bag. Watch their weight closely. Labrador obesity is a genuine problem, and it leads to joint issues, diabetes, and a shorter lifespan.</p>

<p>Goldens respond wonderfully to praise and attention — they want to make you happy, and "good boy" is sometimes all the reward they need. They're slightly more distractible than Labs during training (squirrel! bird! interesting smell!) but they retain what they learn exceptionally well.</p>

<p>Both breeds excel at obedience, and both respond terribly to harsh methods. Positive reinforcement only — it's not just ethical, it's more effective with these breeds.</p>

<h2>Health and lifespan</h2>
<p>This is a section I wish I didn't have to write. Both breeds are prone to certain health issues, and it's important to go in with your eyes open.</p>

<p>Golden Retrievers have a higher incidence of cancer than almost any other breed — studies suggest up to 60% of Goldens will develop cancer at some point. This is a sobering statistic. Common issues also include hip and elbow dysplasia, heart conditions, and skin allergies. Average lifespan is 10 to 12 years, though many live happily into their 13th or 14th year.</p>

<p>Labradors are prone to hip and elbow dysplasia, obesity (and all its complications), exercise-induced collapse (a genetic condition), and eye problems. Average lifespan is 10 to 13 years. Labs from health-tested parents with clear hip and elbow scores tend to live longer, healthier lives — another reason to buy from reputable breeders.</p>

<p>For both breeds, buying from breeders who health-test their breeding dogs (hip scores, elbow scores, eye tests, heart clearances) dramatically reduces your risk.</p>

<h2>Cost of ownership in the UAE</h2>
<p>The puppy price for both breeds is similar — around AED 8,000 to AED 12,000 for a well-bred puppy with documentation. But ongoing costs differ slightly:</p>
<ul>
<li><strong>Food:</strong> Both eat a lot — AED 400 to AED 600 per month for quality food. Labs need strict portion control; Goldens are slightly less food-obsessed.</li>
<li><strong>Grooming:</strong> Goldens cost more to groom professionally — AED 250 to AED 350 per session vs AED 150 to AED 200 for a Lab. And Goldens need it more often.</li>
<li><strong>Vet costs:</strong> Similar for both, but budget for joint supplements and regular hip checks as they age.</li>
</ul>

<h2>Which handles the UAE heat better?</h2>
<p>Neither breed is built for 45-degree summers, but the Lab's short coat gives it a small edge in hot weather. The Golden's long coat traps more heat and needs more careful management during summer — regular grooming to thin the undercoat is essential (but never shave it). For both breeds: walk early, walk late, keep the AC on, and always have water available. Neither breed should be exercised outdoors between 9am and 6pm in summer.</p>

<h2>Colour options</h2>
<p>Labs come in three classic colours: <a href="/product/black-labrador-puppies/">black</a>, <a href="/product/chocolate-labrador-puppies/">chocolate</a>, and <a href="/product/creamy-labradore-puppies/">cream</a>. Goldens range from deep gold to pale English cream — the lighter shades have become especially popular in the UAE. English Cream Goldens, with their almost-white coats, are particularly sought after here.</p>

<h2>Bottom line</h2>
<p><strong>Go with a Golden</strong> if you want a gentle, sensitive companion, don't mind the grooming commitment, prefer a slightly calmer energy, and love that flowing coat.</p>
<p><strong>Go with a Lab</strong> if you want an energetic, cheerful, resilient dog that's lower-maintenance on grooming and your family is active, busy, and maybe a bit loud.</p>
<p>Honestly, you can't go wrong with either. Both will become the centre of your family within a week, and both will give you the best ten to thirteen years of loyalty and love. Check the <a href="/puppies/">available puppies page</a> to see what we have right now.</p>
${WA}
`,
  },
  {
    slug: "teacup-toy-and-mini-puppies-what-the-sizes-really-mean",
    title: "Teacup, Toy and Mini Puppies: What the Sizes Really Mean",
    excerpt: "Teacup, toy and mini are not official sizes. Here is what they usually mean, what to ask the seller, and what to know about very small dogs.",
    seoTitle: "Teacup, Toy & Mini Puppies: What the Sizes Really Mean",
    seoDescription: "Teacup, toy and mini puppies explained: what the sizes mean, how big they grow, health points to know and the questions to ask before buying.",
    cover: "mini-yorkie-puppies",
    body: `
<p>When you start looking at Pomeranians, Poodles, Yorkies, or Chihuahuas online — especially if you're searching for puppies for sale in the UAE — you'll run into these terms everywhere: teacup, toy, mini. And if you're confused about what they actually mean, you're not alone. I'd say nine out of ten people who message us on WhatsApp have questions about these sizes. So let me clear it up properly, because getting this wrong can lead to unmet expectations or, worse, health problems you didn't see coming.</p>

<h2>Here's the honest truth</h2>
<p>There's no official kennel club definition for "teacup" or "mini." They're not recognised breed standards. No FCI registry, no AKC breed standard, no Kennel Club document defines what a "teacup Pomeranian" is. "Toy" is a real category — the Toy group includes breeds like the <a href="/product/apricot-chocolate-red-toy-poodle/">Toy Poodle</a>, and a Toy Poodle has an actual breed standard with height and weight ranges. But "teacup" and "mini" are descriptions that breeders and sellers use to indicate a puppy that's expected to stay smaller than the breed average.</p>

<p>That doesn't make them meaningless — these terms do communicate something real about the puppy's expected adult size. It just means there's no universal standard behind them. One seller's "mini" might be another seller's "toy." One breeder's "teacup" is 1.5kg and another's is 2.5kg. Without a standard, it's down to the individual seller's definition. That's why asking the right questions matters so much.</p>

<h2>What they generally refer to — breed by breed</h2>

<h3>Poodle sizes</h3>
<p>Poodles are one of the few breeds where there actually are formally recognised sizes: Standard (over 38cm, 20-30kg), Miniature (28-38cm, 5-8kg), and Toy (under 28cm, 2-4kg). A "teacup Poodle" would be smaller than a Toy — usually under 2kg. These exist, and they're adorable, but they're not a separate registered breed.</p>

<h3>Pomeranian sizes</h3>
<p>A standard <a href="/product/white-pomeranian-puppies/">Pomeranian</a> is 1.8 to 3.5kg. A "mini Pom" is usually 1.5 to 2.5kg. A "teacup Pom" is under 1.5kg. At that size, you're dealing with a genuinely tiny animal — fragile, requiring special care, and not suitable for homes with rough-and-tumble children.</p>

<h3>Yorkshire Terrier sizes</h3>
<p>A standard <a href="/product/york-shire-puppies/">Yorkie</a> is 2 to 3.5kg. A <a href="/product/mini-yorkie-puppies/">mini Yorkie</a> usually falls between 1.5 to 2.5kg. A teacup Yorkie is under 1.5kg. Yorkies are already small dogs — going smaller means you're in truly delicate territory.</p>

<h3>Maltese sizes</h3>
<p>A standard <a href="/product/maltese-puppies/">Maltese</a> is 3 to 4kg. Mini Maltese run 2 to 3kg. Teacup Maltese under 2kg. The Maltese is naturally a small breed, so the difference between standard and teacup isn't as dramatic as with Poodles, but it's still significant health-wise.</p>

<h2>Nobody can guarantee an exact adult size</h2>
<p>I want to be upfront about this because it trips people up all the time. A puppy's adult size depends on genetics (which you can estimate from the parents), nutrition (proper feeding supports proper growth), and overall health. A good seller will tell you the parents' weights, give you an expected range ("we expect this puppy to be 2 to 2.5kg as an adult"), and be honest about the fact that it's an estimate.</p>

<p>Anyone who guarantees your puppy will be exactly 1.8kg as an adult is making a promise they can't keep. Genetics don't work that precisely. I've seen puppies from tiny parents grow to be on the larger side, and puppies from larger parents stay small. The parents' sizes give you the best indicator, but they're not a contract. Be wary of anyone who sells size guarantees — that's a red flag, not a feature.</p>

<h2>Growth expectations for small breeds</h2>
<p>Small breed puppies grow faster than large breed puppies and typically reach their adult weight by 8 to 12 months:</p>
<ul>
<li><strong>8 weeks (when you get the puppy):</strong> Usually 20 to 30% of adult weight</li>
<li><strong>12 weeks:</strong> About 40 to 50% of adult weight</li>
<li><strong>6 months:</strong> About 75 to 85% of adult weight</li>
<li><strong>8 to 10 months:</strong> Very close to or at adult weight</li>
<li><strong>12 months:</strong> Fully grown in most toy and mini breeds</li>
</ul>
<p>If your 12-week-old "teacup" Pomeranian already weighs 1.2kg, it's probably going to be at least 2.5 to 3kg as an adult. That's not a teacup — that's a standard Pom. A genuinely tiny puppy at 12 weeks would weigh well under 1kg. This is why asking for the puppy's current weight and the parents' weights gives you a reality check on what the adult size will actually be.</p>

<h2>Things to know about very small dogs</h2>
<p>Tiny puppies are adorable — I completely understand the appeal. But they do come with some specific needs that you should know about before you commit:</p>

<ul>
<li><strong>Hypoglycaemia (blood sugar drops).</strong> This is probably the number one health concern with teacup-size puppies. Very small puppies have tiny reserves and can develop dangerously low blood sugar if they go too long without eating — sometimes just four to five hours is enough. Symptoms include lethargy, trembling, and in severe cases, seizures. Small, frequent meals (four to five times a day for puppies under 1kg) are absolutely essential. Keep Nutri-Cal or honey on hand for emergencies — a small amount rubbed on the gums can buy you time while getting to a vet.</li>

<li><strong>Fragile bones.</strong> A jump off the sofa that a Lab would barely notice could break a teacup puppy's leg. A toddler sitting on one accidentally can cause a fracture. These aren't exaggerations — I've seen it happen. Handle with care, supervise around young children, and consider ramps or steps for furniture access instead of letting them jump.</li>

<li><strong>Temperature sensitivity.</strong> They get cold easily (even in the UAE, AC can make a tiny dog shiver) and overheat quickly outdoors. In the UAE, that means careful management of both AC temperature indoors and outdoor exposure in summer. They have very little body mass to regulate their own temperature.</li>

<li><strong>Dental issues.</strong> Small jaws mean crowded teeth, which means food gets trapped, plaque builds up, and dental disease sets in earlier than in larger breeds. Stay on top of dental care from the start — brushing, dental chews, and regular vet dental checks. Some teacup dogs need dental cleanings under anaesthesia as early as two years old.</li>

<li><strong>Collapsed trachea.</strong> Common in tiny breeds, especially Yorkies and Pomeranians. The cartilage rings in the windpipe weaken, causing a honking cough, especially during excitement or exercise. Use a harness, never a collar attached to a leash — the pulling pressure on a collar can worsen tracheal problems.</li>

<li><strong>Liver shunts.</strong> More common in very small dogs. A liver shunt is a blood vessel abnormality that bypasses the liver, causing toxins to build up. Symptoms include poor growth, seizures, and disorientation. Reputable breeders screen for this.</li>
</ul>

<p>I'm not saying this to scare you — I'm saying it because small is lovely, but healthy is better. For families with young kids, a slightly larger size within the breed is usually the safer, more practical choice.</p>

<h2>Feeding tiny breeds</h2>
<p>Small dogs have fast metabolisms and burn through their energy reserves quickly. A feeding schedule that works for a Labrador will not work for a 1.5kg Pomeranian. Here's what I recommend:</p>
<ul>
<li>Four to five small meals per day for puppies under six months (or under 1.5kg)</li>
<li>Three meals a day from six months to one year</li>
<li>Two meals a day for adults (some very tiny dogs do better with three meals for life)</li>
<li>Use a high-quality small-breed puppy formula — Royal Canin X-Small Puppy, Hill's Small Paws, or Orijen Small Breed are all solid choices available at PetZone and PetsDeli in Dubai</li>
<li>Never skip a meal for a teacup puppy. Set an alarm if you have to.</li>
</ul>

<h2>Questions to ask before you buy</h2>
<ul>
<li>How much do the parents weigh? (This is the single best predictor of adult size)</li>
<li>What adult weight range do you expect for this specific puppy?</li>
<li>How old is the puppy, and how much does it weigh right now?</li>
<li>Has a vet examined the puppy? Can I see the records?</li>
<li>What vaccinations, microchip, and documentation does it come with?</li>
<li>What's the puppy been eating, and how many times per day?</li>
</ul>

<p>On our <a href="/puppies/">available puppies page</a>, you can filter by size: Teacup, Toy, Mini, Small, Medium, Large, and Giant. Several breeds come in multiple sizes — Poodles, Pomeranians, Yorkies, Chihuahuas — so you can find the right fit for your life. And we always tell you the parents' sizes and the expected adult range, because that's information you deserve to have before you decide.</p>
${WA}
`,
  },
  {
    slug: "how-to-choose-a-healthy-puppy-10-checks-before-you-buy",
    title: "How to Choose a Healthy Puppy: 10 Checks Before You Buy",
    excerpt: "A simple checklist for the day you meet your puppy: what to look at, what to ask, and which papers must be in your hand.",
    seoTitle: "How to Choose a Healthy Puppy: 10 Checks Before You Buy",
    seoDescription: "A 10-point checklist for choosing a healthy puppy in the UAE: eyes, coat, behaviour, vaccinations, microchip, health certificate and seller questions.",
    cover: "cavapoo-puppies",
    body: `
<p>You've found a puppy you're in love with. Maybe you've been scrolling through listings for puppies for sale in the UAE, maybe a friend recommended a seller, maybe you've been going back and forth on WhatsApp for a week about a particular breed. Whatever brought you here, you're about to make a decision that comes with 10 to 15 years of responsibility and, hopefully, joy.</p>

<p>Before you hand over the money, take ten minutes and go through this checklist. I know it's hard to be rational when you're looking at a tiny face with big eyes — trust me, I've been doing this for years and it still gets me. But this is the single best thing you can do to protect yourself and the puppy. A healthy puppy from a transparent seller is the foundation of a great experience. A sick puppy from a dodgy seller is the beginning of heartbreak and unexpected vet bills.</p>

<h2>The 10 things to check</h2>

<ol>
<li><strong>Eyes.</strong> They should be bright, clear, and alert. No heavy discharge (a tiny bit of clear moisture is normal, but thick yellow or green discharge is not). No redness around the whites. No cloudy film over the pupil. The puppy should track your finger when you move it across its field of vision. Teary stains under the eyes are common in white breeds like <a href="/product/maltese-puppies/">Maltese</a> and don't indicate illness, but excessive tearing warrants a vet check.</li>

<li><strong>Ears and nose.</strong> Clean ears with no bad smell. If you see dark, waxy buildup or the puppy is constantly scratching its ears, it could have ear mites or an infection — both treatable but shouldn't be present in a puppy being sold as healthy. An ear infection has a very distinctive sour smell — you'll know it if it's there. The nose should be clean and slightly moist. Persistent sneezing, nasal discharge (especially coloured), or coughing are red flags that could indicate kennel cough or worse.</li>

<li><strong>Coat and skin.</strong> The coat should look healthy, clean, and suit the breed (fluffy for a <a href="/product/white-pomeranian-puppies/">Pomeranian</a>, silky for a <a href="/product/york-shire-puppies/">Yorkie</a>, soft and wavy for a <a href="/product/cavapoo-puppies/">Cavapoo</a>). No bald spots, no sores, no red patches, no visible fleas or flea dirt (tiny black specks in the fur). Run your hand along the belly — it should feel smooth, not bumpy or crusty. Part the fur in a few places and look at the skin underneath — it should be healthy-looking, not inflamed or flaky. Ringworm (a fungal infection, not actually a worm) is common in puppies and shows up as circular bald patches — it's treatable but contagious.</li>

<li><strong>Body condition.</strong> Not too thin (ribs and spine shouldn't be visually prominent), not pot-bellied. You should be able to feel the ribs easily under a light covering of flesh — if you can't feel them at all, the puppy might be overfed or have another issue. A swollen, hard belly in a puppy is a classic sign of worms — common, treatable, but the seller should have dewormed the puppy before offering it for sale.</li>

<li><strong>Mouth.</strong> Gently lift the lips and look at the gums. They should be pink, moist, and healthy-looking. Pale, white, or bluish gums are a red flag — they can indicate anaemia, dehydration, or circulatory problems. The teeth should be clean and white for the puppy's age. Check the bite — the teeth should align properly (though this varies slightly by breed; flat-faced breeds like <a href="/product/pug-puppies/">Pugs</a> have an underbite that's normal for them).</li>

<li><strong>Movement.</strong> Watch the puppy walk and play for at least five minutes. No limping, no dragging a leg, no bunny-hopping (which can indicate hip problems), no reluctance to move. A healthy puppy is curious and active — it explores, it plays, it follows you. It should be able to walk, trot, and change direction smoothly. Check that it uses all four legs evenly.</li>

<li><strong>Personality and behaviour.</strong> You want a puppy that's interested in you — it comes to investigate, it sniffs your hand, it's curious about its surroundings. Not cowering in a corner, not completely shut down, not trembling uncontrollably. Some shyness is normal, especially in a new environment with unfamiliar people, but extreme fear isn't. On the other end, a puppy that's biting hard, growling aggressively, or impossible to settle might have temperament issues. You're looking for the middle ground: confident, curious, responsive to gentle handling.</li>

<li><strong>Age.</strong> The puppy should be at least 8 weeks old. This isn't a suggestion — it's a critical developmental milestone. Puppies separated from their mother and littermates too early (4 to 6 weeks) develop more health problems, more behavioural issues (anxiety, aggression, difficulty socialising with other dogs), and are harder to train. If the seller says it's "about 5 weeks but ready to go" — walk away. A good breeder keeps puppies until at least 8 weeks, and many keep them until 10 to 12 weeks, especially for very small breeds.</li>

<li><strong>Paperwork.</strong> This isn't optional. You need:</li>
</ol>
<ul>
<li>A vaccination card with actual dates, specific vaccine names (not just "vaccine 1"), batch numbers ideally, and a vet's stamp or signature</li>
<li>Deworming records with dates and the product used</li>
<li>A microchip number that you can verify matches the puppy (ask the seller to scan it in front of you if possible)</li>
<li>A health certificate from a licensed vet, ideally issued within the last week</li>
</ul>
<p>If the seller says "I'll send the papers later" or "the vet hasn't finished the card yet" — that's a problem. Papers should be ready when the puppy is presented for sale.</p>

<ol start="10">
<li><strong>The seller themselves.</strong> This might be the most important check. Do they answer your questions openly and patiently? Can they tell you where the puppy was raised, who the parents are, and what the puppy has been eating? Will they show you the parents or at least provide their details and photos? Do they know the breed — can they tell you about its temperament, common health issues, and care needs? A trustworthy seller doesn't pressure you, doesn't rush you, doesn't make you feel guilty for asking questions, and doesn't disappear after the sale. They want you to come back for your next puppy and recommend them to friends. A bad seller wants your money and wants you gone.</li>
</ol>

<h2>The breeder or seller visit</h2>
<p>If you can visit in person, here's what to notice beyond the puppy itself:</p>
<ul>
<li>Is the area clean and well-maintained? Puppies in dirty, cramped conditions are at higher risk for disease.</li>
<li>Can you see the mother? A healthy, well-treated mother is a strong indicator of a healthy puppy. If the seller says the mother "isn't available" or "is at another location" — ask why.</li>
<li>How many breeds does the seller have? A reputable breeder specialises in one to three breeds and knows them inside out. A seller with fifteen different breeds all available at once raises questions about where the puppies are actually coming from.</li>
<li>Do the puppies seem socialised? Do they approach people? Are they used to being handled?</li>
</ul>
<p>If you're buying remotely (which is common in the UAE given the distances involved), insist on a live video call where you can see the puppy move, interact, and be examined. Not a pre-recorded video — live.</p>

<h2>What to ask</h2>
<ul>
<li>What has this puppy been eating, and how many times a day? (You'll want to continue the same food for the first week)</li>
<li>Which vaccines has it had, and when's the next one due?</li>
<li>What's the expected adult size and weight?</li>
<li>Has the puppy been around children or other pets?</li>
<li>What's your policy if my vet finds a health issue in the first few days?</li>
<li>Can I contact you after the sale if I have questions? (A seller who says yes and means it is worth their weight in gold)</li>
</ul>

<h2>Book a vet visit within the first 48 hours</h2>
<p>This isn't optional. Even if the puppy looks perfectly healthy and has a stack of paperwork, have your own vet confirm it independently. It gives you peace of mind, establishes a baseline for the puppy's health, and sets you up with a vet who knows your dog from day one. If the vet finds something concerning, you'll be glad you caught it early — both for the puppy's sake and for any recourse you might need with the seller.</p>

<h2>Things that should make you walk away</h2>
<ul>
<li>No paperwork, or paperwork that doesn't match the microchip number</li>
<li>A suspiciously low price for a popular breed — if everyone else is selling <a href="/product/golden-retriever-puppies-english-cream-double-coat/">Golden Retrievers</a> for AED 8,000 and someone offers one for AED 2,000, something is wrong</li>
<li>A seller who won't let you see the puppy in person or on a live video call</li>
<li>Dozens of different breeds for sale with no clear explanation of where they come from</li>
<li>Pressure to decide immediately — "someone else is interested," "price goes up tomorrow," "this is the last one"</li>
<li>Refusing to provide after-sale support or a health guarantee</li>
</ul>
<p>Every Puppyfy puppy is vet-checked and comes with full documentation — vaccination card, deworming records, microchip, and health certificate. We answer questions before and after the sale, because that's how this should work. Browse the <a href="/puppies/">available puppies</a> — and ask us anything before you decide.</p>
${WA}
`,
  },
  {
    slug: "your-first-week-with-a-new-puppy-a-simple-checklist",
    title: "Your First Week With a New Puppy: A Simple Checklist",
    excerpt: "What to buy, how to set up your home and what to expect in the first seven days: sleep, food, toilet training and the first vet visit.",
    seoTitle: "First Week With a New Puppy: A Simple Checklist",
    seoDescription: "Bringing a puppy home? A simple first-week checklist: supplies, feeding, sleeping, toilet training, first vet visit and gentle socialisation.",
    cover: "shih-tzu-puppies",
    body: `
<p>The day you bring your puppy home is one of the best days. It's also, honestly, one of the most exhausting. Everything is brand new to your puppy — the smells, the sounds, the tile floor, the AC hum, the echo in the corridor, your face, your kids' voices — and it's going to take a few days to settle in. I've talked to hundreds of new puppy owners in the UAE, and the ones who have the smoothest first week are the ones who prepared properly and set realistic expectations.</p>

<p>Here's how to make that first week go as well as possible — from the supplies you need before arrival, to a day-by-day breakdown of what to expect, to the mistakes I see people make over and over.</p>

<h2>Get this ready before the puppy arrives</h2>
<p>Don't pick up the puppy and then scramble to buy supplies. You'll be too busy falling in love and cleaning up accidents. Get everything set up a day or two in advance:</p>
<ul>
<li><strong>A crate or bed</strong> in a quiet corner — not in direct sunlight, not right under the AC vent. The crate should be big enough for the puppy to stand, turn around, and lie down. If you're crate training (which I strongly recommend), make it cosy with a blanket and a chew toy.</li>
<li><strong>Food and water bowls.</strong> Stainless steel is best. Ask us (or the seller) what the puppy's been eating — keep it the same for the first week. Changing food suddenly causes diarrhoea. You can transition later, gradually.</li>
<li><strong>The right food.</strong> Have a bag of what the puppy's currently eating ready to go. Royal Canin, Hill's Science Diet, and Orijen all make excellent puppy formulas — PetZone and PetsDeli stock them.</li>
<li><strong>A collar, lead, and an ID tag</strong> with your phone number. Dogs get loose in corridors and parking garages. An ID tag costs AED 20 and could be the reason you get your dog back.</li>
<li><strong>Training pads.</strong> In an apartment, these are essential for the first few weeks. Get the heavy-duty ones with adhesive strips — cheap ones leak through.</li>
<li><strong>Chew toys.</strong> Trust me, you want a lot of them. A bored puppy will find your shoes, your phone cable, and the corner of your kitchen cabinet. Kongs, Nylabones, rope toys — rotate them so the puppy doesn't get bored.</li>
<li><strong>An enzyme-based cleaner</strong> like Nature's Miracle or Simple Solution. Regular cleaners don't fully remove the scent to a dog's nose, so the puppy keeps going back to the same spot.</li>
<li><strong>Puppy-proof the house.</strong> Hide electrical cables. Block off stairs with baby gates. Check balcony railings for gaps. Move houseplants to high shelves — many common ones (lilies, aloe, pothos) are toxic to dogs.</li>
</ul>

<h2>Day-by-day: what to expect</h2>

<h3>Day 1: Arrival — keep it quiet</h3>
<p>Keep it low-key. Let the puppy explore one room, sniff around, and find its bed. Don't invite the whole family over — that can wait until day three. Offer water and a small meal. Show it the toilet pad. Talk softly. Let it approach you on its terms. When it cries at night (it probably will), know that it's completely normal. A warm bed, a heartbeat toy wrapped in a towel, and a dark, quiet room help more than anything.</p>

<h3>Day 2: First routine</h3>
<p>Start establishing the routine that shapes everything. Same feeding times, same toilet trips, same play sessions. Dogs thrive on predictability. Take the puppy to the pad after every meal, nap, and play session. When it goes in the right spot, praise like it just won a Nobel Prize. When it has an accident, clean it up silently and move on. Book your vet visit today.</p>

<h3>Day 3-4: Crate training begins</h3>
<p>The puppy is learning your face, your voice, and the layout. Introduce the crate as a positive space — feed meals in it, toss treats in, keep the door open at first. Never use it as punishment. Start with short closed-door periods (5 to 10 minutes while you're in the room) and gradually extend. Most puppies accept the crate within three to five days.</p>

<h3>Day 5-7: Building confidence</h3>
<p>The puppy is getting braver and will test boundaries — chewing something it shouldn't, ignoring the pad. Redirect, don't punish. Offer the chew toy instead of your shoe. Start very short training sessions — just "sit" for now, five minutes maximum. By day seven, you should have a basic routine going: the puppy knows where food comes from, where to sleep, and roughly where to toilet. If something feels off — persistent lethargy, refusal to eat, ongoing diarrhoea — call your vet.</p>

<h2>Feeding in the first week</h2>
<p>Young puppies eat three to four small meals a day. The breeder or seller should tell you exactly what food and how much — stick with that for the first week. If you want to switch brands later, do it gradually over seven to ten days, mixing old and new in increasing ratios.</p>
<p>Absolute no-go foods: chocolate, grapes and raisins, onions and garlic, cooked bones (they splinter), macadamia nuts, avocado, and anything with xylitol (found in some sugar-free products and peanut butters). These are genuinely toxic to dogs. Make sure everyone in your household knows the list.</p>

<h2>Toilet training starts now</h2>
<p>Take the puppy to the pad or outside after it wakes up, after it eats, after it plays, and every one to two hours in between. Young puppies have tiny bladders and very little control — accidents are not defiance, they're biology. When it goes in the right spot, make a fuss — praise, a small treat, happy voice, whatever works for your puppy. When it has an accident (and it will, repeatedly, for weeks), don't shout, don't rub its nose in it, don't punish. Clean it up with enzyme cleaner and move on. Punishment doesn't teach the puppy where to go — it just teaches the puppy to hide from you when it needs to go, which makes training harder, not easier.</p>

<p>Most puppies are reasonably house-trained by 4 to 6 months. Some take longer. Small breeds sometimes take longer than large breeds. It's a marathon, not a sprint.</p>

<h2>Sleep</h2>
<p>Puppies sleep an extraordinary amount — up to 18 hours a day. Let them. Don't wake a sleeping puppy for playtime, and teach your kids to do the same (this is important — kids love playing with puppies, and they need to learn that sleeping puppies are off limits). Rest is when puppies grow, their immune systems develop, and they process everything they've learned. A puppy that doesn't get enough sleep becomes cranky, bitey, and harder to train — just like a human toddler.</p>

<h2>The first vet visit</h2>
<p>Book it within the first two days of bringing the puppy home. Bring the vaccination card and microchip number. Your vet will do a general health check — eyes, ears, heart, lungs, abdomen, joints — and plan the remaining vaccines and deworming. This is also a great time to ask all those questions you've been saving up: what food to use, when to start training, what products are safe for flea prevention at this age, when to start walking outside. Vets in the UAE are generally excellent — clinics like Modern Vet, Canadian Veterinary Clinic, and British Veterinary Hospital in Dubai are all well-equipped for puppy consultations. More on the vaccine schedule in our <a href="/puppy-vaccination-schedule-in-the-uae-what-to-give-and-when/">vaccination guide</a>.</p>

<h2>Gentle introductions</h2>
<p>New people, new sounds, new surfaces — introduce them slowly and pair them with treats and calm energy. Let the puppy meet family members one or two at a time, not all at once. Introduce it to different floor surfaces (tile, carpet, grass). Let it hear household sounds (vacuum cleaner, blender, doorbell) at a distance first, then closer as it gets comfortable. But until the vaccines are fully done, skip the dog park and busy pet shops. Ask your vet about safe ways to socialise in the meantime — puppy socialisation classes (some UAE pet training centres offer them for vaccinated puppies in controlled environments) and playdates with known, fully vaccinated dogs are great options.</p>

<h2>Give it time</h2>
<p>Every puppy adjusts at its own pace. Some settle in within a day and act like they've lived with you forever. Others need a week or two before they truly relax. Some regress — they seem fine on day three and then have a meltdown on day five. All of this is normal. A calm, predictable routine is the fastest path to a confident, happy dog. Don't overwhelm the puppy with experiences, don't change everything at once, and don't expect perfection. You're building a relationship that's going to last a decade or more — the first week is just the beginning.</p>
${WA}
`,
  },
  {
    slug: "pomeranian-care-guide-coat-grooming-and-temperament",
    title: "Pomeranian Care Guide: Coat, Grooming and Temperament",
    excerpt: "Everything a new Pomeranian owner should know: the thick coat, brushing, training, exercise and keeping this little fluffy dog comfortable in the UAE.",
    seoTitle: "Pomeranian Care Guide: Coat, Grooming & Temperament",
    seoDescription: "How to care for a Pomeranian in the UAE: grooming the double coat, training, exercise, health points and keeping it cool in the heat.",
    cover: "white-pomeranian-puppies",
    body: `
<p>Pomeranians are basically tiny lions with big personalities. They're fluffy, they're loud, they think they're in charge of everything, and they're one of the most popular small breeds we sell here in the UAE. I've placed Poms in apartments across Dubai Marina, Downtown, JLT, and Business Bay, in villas in Arabian Ranches and Al Barsha, and in family homes across Abu Dhabi — and there's a reason they keep being the breed people fall in love with. They're equal parts adorable and hilarious, with a streak of stubbornness that makes them endlessly entertaining.</p>

<p>If you've just got one (or you're thinking about it), here's everything you need to know about living with a Pom in the UAE — the good, the challenging, and the genuinely important stuff that'll keep your fluffy little companion healthy and happy.</p>

<h2>Personality — small dog, massive attitude</h2>
<p>Don't let the size fool you. A <a href="/product/white-pomeranian-puppies/">Pomeranian</a> at 2kg has the confidence of a dog ten times its weight. Poms are bold, curious, alert, and incredibly loyal to their person. They'll march up to a German Shepherd like they own the place. They're also smart — frighteningly smart, actually. They learn tricks quickly, they figure out your routines within days, they know exactly which face to pull to get what they want from you, and they'll test your boundaries constantly until you establish who's in charge (spoiler: they'll always think it should be them).</p>

<p>The flip side: they can be barky. Very barky. A Pom that isn't trained from day one will bark at the doorbell, at neighbours walking past, at birds, at shadows. In a Dubai apartment building, this turns into a noise complaint fast. Start "quiet" training from the first week — use positive reinforcement, treat and praise when they stop barking on command. Never yell at a barking Pom — they interpret shouting as you joining in.</p>

<p>Socialise them with different people, dogs, and sounds while they're young. A well-socialised Pom is confident and friendly. An unsocialised one is nervous, snappy, and reactive — a completely different dog.</p>

<p>Be careful with very young children and bigger dogs. At 2 to 3kg, a Pom can get hurt easily. A toddler dropping one can cause a broken bone. Supervise interactions, always.</p>

<h2>Size and what to expect as they grow</h2>
<p>An adult Pomeranian is usually 2 to 3.5kg and about 18 to 24cm tall at the shoulder. They reach their adult size by about 10 to 12 months, though the coat continues to fill out until about 18 months to 2 years — the famous "Pom floof" takes time to develop. As puppies, they can look surprisingly scrawny before the adult coat comes in. Don't worry — the fluff is coming.</p>

<p>They come in mini and teacup sizes too — we've got a guide on <a href="/teacup-toy-and-mini-puppies-what-the-sizes-really-mean/">what those sizes actually mean</a> if you're curious. The smaller sizes are more fragile and require extra care, particularly around feeding frequency (tiny Poms need to eat more often to avoid blood sugar drops).</p>

<h2>That magnificent coat — care and grooming</h2>
<p>A Pom's double coat — soft, dense undercoat plus a longer, harsher outer coat — is what makes them look so spectacular. That fluffy cloud around their neck and chest (called the "ruff"), the plumed tail curved over their back, the fluffy pantaloons on the back legs — it's a lot of coat on a little dog. And it's also what makes them higher-maintenance on the grooming front than most people expect.</p>

<h3>Brushing</h3>
<p>Two to three times a week at minimum, daily during shedding season. Poms in the UAE tend to shed more consistently because of the temperature swings between AC indoors and heat outdoors. Use a pin brush or slicker brush for the main coat, and a fine-toothed comb for tricky areas — behind the ears, around the legs, under the belly. Always brush before bathing, not after — wet mats tighten and become impossible to remove without cutting.</p>

<h3>Bathing</h3>
<p>Every three to four weeks with a proper dog shampoo (not human shampoo — wrong pH). Tropiclean and Isle of Dogs are both available in Dubai. Dry them thoroughly — that thick undercoat holds moisture like a sponge, and dampness can cause hot spots and skin infections. Use a blow dryer on a cool setting and dry section by section.</p>

<h3>Professional grooming</h3>
<p>Every six to eight weeks for a full groom — bath, blow-dry, trim, sanitary clip, nail trim, and ear clean. Expect AED 150 to AED 250 per session in Dubai.</p>

<h3>Never shave the coat</h3>
<p>A double coat insulates against heat and protects against sunburn. Shaving can cause "coat funk" — permanent damage where the coat grows back patchy or a different texture. Ask your groomer for a "teddy bear trim" instead, and thin the undercoat with a proper undercoat rake.</p>

<h2>Surviving the UAE summers</h2>
<ul>
<li>Walks before 8am and after 7pm only. Keep them short — 15 to 20 minutes maximum in summer. Do the hand test on the pavement before every walk.</li>
<li>Keep the AC running during the day — this isn't optional for a Pom in the UAE. Set it to a comfortable 22 to 24 degrees Celsius. They tolerate AC well.</li>
<li>Fresh water everywhere. Add ice cubes in summer — most Poms enjoy fishing them out, which is adorable and keeps them hydrated.</li>
<li>Never leave them in a car. Not even for a minute.</li>
<li>Consider a cooling mat — the gel-based ones from PetZone work well.</li>
</ul>

<h2>Exercise — less than you think</h2>
<p>Two short walks a day (15 to 20 minutes each) and some indoor playtime is plenty. Poms are not marathon runners — they're sprinters. Short bursts of energy followed by long naps is their natural rhythm. Over-exercising a Pom, especially in the heat, is genuinely dangerous.</p>
<p>What Poms love even more than walks is learning tricks — it's mental exercise that tires them out without overheating them. Teach them "sit," "shake," "spin," "speak," and "quiet." Five minutes of training is worth thirty minutes of walking in terms of keeping them mentally stimulated and tired. Poms love showing off, and they'll repeat tricks for treats until you run out of treats or patience.</p>

<h2>Training — start early, stay consistent</h2>
<p>Poms are smart, which means they're easy to train when you're consistent — and absolute nightmares when you're not. The biggest mistake new owners make is treating them like a toy instead of a dog. They need boundaries and rules. Start with house training, "sit," "come," and "quiet" in the first week. Use positive reinforcement exclusively — Poms are sensitive and shut down if you yell. Keep sessions short (five minutes), frequent (three to four times a day), and always end on a success. Socialisation between 8 and 16 weeks — different people, environments, and sounds — is critical for developing a well-adjusted adult dog.</p>

<h2>Common health issues</h2>
<p>Pomeranians are generally healthy dogs with a lifespan of 12 to 16 years, but they're prone to certain issues you should know about:</p>

<ul>
<li><strong>Dental disease:</strong> The number one health issue in Poms. Small jaws mean crowded teeth, plaque builds up fast. Brush their teeth several times a week with a finger brush and dog-specific toothpaste. Dental cleanings under anaesthesia may be needed as early as age two, and neglected teeth can lead to infections affecting the heart and kidneys.</li>

<li><strong>Luxating patella (slipping kneecap):</strong> Very common in small breeds. The kneecap slides out of its groove, causing skipping on one leg. Severe cases need surgery (AED 5,000 to AED 10,000). Prevent it by maintaining a healthy weight and using ramps instead of letting them jump from furniture.</li>

<li><strong>Tracheal collapse:</strong> Weakened windpipe cartilage causes a honking cough, especially during excitement or pulling on a leash. Always use a harness, never a collar. Non-negotiable for Poms.</li>

<li><strong>Alopecia X:</strong> A coat condition where patches of hair fall out and skin darkens. Cosmetic rather than life-threatening, but distressing in a breed famous for its coat.</li>

<li><strong>Weight gain:</strong> Extra weight strains tiny joints, worsens luxating patella, and shortens lifespan. An adult Pom should have a visible waist from above, and you should feel the ribs easily.</li>
</ul>

<h2>Feeding</h2>
<p>A good-quality small-breed kibble in measured portions. Royal Canin Pomeranian Adult (yes, there's a breed-specific formula), Hill's Small Paws, or Orijen Small Breed are all solid choices available at PetZone and PetsDeli in the UAE. Follow your vet's guidance on amounts — it's less than you'd think. An adult Pom needs only about 1/4 to 1/2 cup of kibble per day, split into two meals.</p>

<p>Go easy on treats — no more than 10% of daily calories. Never free-feed (leaving food out all day). Poms will eat until they're round if you let them. For puppies, feed three to four times a day until six months, then transition to twice daily. Teacup Pom puppies may need even more frequent meals to prevent hypoglycaemia.</p>

<p>See the <a href="/product/white-pomeranian-puppies/">Pomeranian puppies</a> we have available, or check out our <a href="/puppies/">full range</a>. And if you've got questions about Pom care — or any breed — just ask. We've been doing this long enough to have practical answers for nearly everything.</p>
${WA}
`,
  },
];
