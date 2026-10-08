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

const WA = `<p><strong>Questions about a puppy or a breed?</strong> Message us on WhatsApp from the button on this page: we answer every question before you decide, and we deliver across all seven emirates.</p>`;

export const batch1: ArticleDraft[] = [
  {
    slug: "how-much-does-a-puppy-cost-in-dubai-and-the-uae",
    title: "How Much Does a Puppy Cost in Dubai and the UAE? A Clear Price Guide",
    excerpt: "What really decides the price of a puppy in the UAE, what should be included, and what the usual price ranges are for popular breeds.",
    seoTitle: "How Much Does a Puppy Cost in Dubai & the UAE? Price Guide",
    seoDescription: "Puppy prices in Dubai and the UAE explained: what affects the price, what a fair price includes, and typical ranges for popular breeds in AED.",
    cover: "golden-retriever-puppies-english-cream-double-coat",
    body: `
<p>If you search for the price of a puppy in Dubai, you will see numbers from a few hundred to tens of thousands of dirhams. The difference is not random. This guide explains what sits behind the price, so you can tell a fair offer from one that will cost you more later.</p>

<h2>What decides the price of a puppy</h2>
<ul>
<li><strong>The breed and how many are available.</strong> Popular small breeds such as the Maltese and the Shih Tzu are easier to find than a Bernese Mountain Dog or an Ibizan Hound, which are rare in the UAE.</li>
<li><strong>Imported or local.</strong> A puppy brought from a registered breeder abroad needs a health certificate, a permit, a flight and quarantine rules, so imported puppies cost more.</li>
<li><strong>Size and coat.</strong> Toy and mini sizes, and special coat colours, are priced higher because fewer puppies in a litter qualify.</li>
<li><strong>Papers and pedigree.</strong> A puppy with a proper vaccination record, a microchip and a vet's health certificate costs more than one sold without any of these. That extra cost is money well spent.</li>
<li><strong>Age and health checks.</strong> A puppy that is old enough to leave its mother (about 8 weeks or more) and has been seen by a vet costs more to raise.</li>
</ul>

<h2>Typical price ranges (October 2026)</h2>
<p>Prices change with the season and the stock, so treat these as a guide, not an offer:</p>
<ul>
<li><a href="/product/maltese-puppies/">Maltese</a> and <a href="/product/shih-tzu-puppies/">Shih Tzu</a>: from about AED 6,000.</li>
<li><a href="/product/golden-retriever-puppies-english-cream-double-coat/">Golden Retriever</a>, <a href="/product/black-labrador-puppies/">Labrador</a> and <a href="/product/pug-puppies/">Pug</a>: about AED 8,000.</li>
<li><a href="/product/white-pomeranian-puppies/">Pomeranian</a> and <a href="/product/apricot-chocolate-red-toy-poodle/">Toy Poodle</a>: about AED 9,000.</li>
<li><a href="/product/cavapoo-puppies/">Cavapoo</a>: about AED 11,000.</li>
<li>Rare or imported breeds: AED 20,000 and above.</li>
</ul>
<p>You can see today's prices, in dirhams, on the <a href="/puppies/">Available puppies</a> and <a href="/importing/">Importing</a> pages.</p>

<h2>What a fair price should include</h2>
<ul>
<li>Age-appropriate vaccinations and deworming, written in a vaccination card.</li>
<li>A registered microchip.</li>
<li>A health certificate from a licensed vet.</li>
<li>Passport or vaccination records, and import papers where they apply.</li>
<li>Delivery, or a clear price for delivery.</li>
</ul>
<p>If any of these is missing, ask why, and ask what it will cost you to do it yourself.</p>

<h2>Warning signs of a price that is too good to be true</h2>
<ul>
<li>A very low price for a rare breed.</li>
<li>No vaccination card, no microchip, no health certificate.</li>
<li>The seller will not let you see the puppy or video call, or will not say where it comes from.</li>
<li>Pressure to pay a deposit at once.</li>
</ul>

<h2>The cost after you buy</h2>
<p>The price of the puppy is the start. Plan for good food, vet visits and boosters, grooming for long-coated breeds, a bed, a crate, toys and, in the UAE, registering your dog with your municipality and keeping its vaccinations up to date. A healthy, well-raised puppy from a seller who shows its papers usually costs less over the years than a cheap one with problems.</p>
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
<p>Most people in Dubai and Abu Dhabi live in apartments, and many of them dream of a dog. The good news: a dog does not need a garden to be happy. It needs the right size, the right energy level, and an owner who gives it time every day. These breeds usually do well in flats.</p>

<h2>What makes a breed good for an apartment</h2>
<ul>
<li><strong>Size:</strong> small to medium, so it is comfortable and easy to carry in a lift.</li>
<li><strong>Energy:</strong> moderate. High-energy working breeds get bored and noisy indoors.</li>
<li><strong>Barking:</strong> a dog that barks at every sound is hard on the neighbours.</li>
<li><strong>Coat:</strong> a coat you can keep clean and cool in the heat.</li>
<li><strong>Company:</strong> breeds that bond with people and cope with being at home.</li>
</ul>

<h2>Breeds that suit apartment life</h2>
<h3>Maltese</h3>
<p>Gentle, playful and light. The <a href="/product/maltese-puppies/">Maltese</a> sheds very little and is happy with short walks and play at home. Its long white coat needs brushing most days.</p>
<h3>Shih Tzu</h3>
<p>A calm, affectionate companion. The <a href="/product/shih-tzu-puppies/">Shih Tzu</a> loves to be with its family and does not need long runs. Keep the coat trimmed in summer.</p>
<h3>Pomeranian</h3>
<p>Small, lively and bold. The <a href="/product/white-pomeranian-puppies/">Pomeranian</a> is a good watchdog for its size, so teach it early not to bark at everything. Its thick coat needs regular brushing.</p>
<h3>Cavapoo</h3>
<p>Friendly, clever and gentle with children. The <a href="/product/cavapoo-puppies/">Cavapoo</a> has a soft, low-shedding coat and adapts well to flat living.</p>
<h3>Toy Poodle</h3>
<p>Very intelligent and easy to train. The <a href="/product/apricot-chocolate-red-toy-poodle/">Toy Poodle</a> sheds little, which helps in a small space.</p>
<h3>Yorkshire Terrier</h3>
<p>Brave and affectionate, with a silky coat. The <a href="/product/york-shire-puppies/">Yorkie</a> is tiny, but needs training so it does not become a barker.</p>

<h2>Breeds that usually find flat life hard</h2>
<p>A <a href="/product/huskey/">Husky</a>, an Alaskan Malamute or a Border Collie needs hours of exercise and a job to do. In a hot climate and a small flat, they can become unhappy and destructive. If you love a large breed, be honest about the time and space you have.</p>

<h2>Tips for apartment life in the UAE</h2>
<ul>
<li>Walk early in the morning and after sunset. Midday pavements are too hot for paws.</li>
<li>Give mental exercise at home: puzzle feeders, short training sessions, safe chew toys.</li>
<li>Teach "quiet" early, and be considerate to neighbours.</li>
<li>Set up a cool corner with water and a bed away from the sun and the air-conditioner's direct blast.</li>
<li>Check your building's rules about pets before you bring a dog home.</li>
</ul>
<p>Not sure which breed fits your flat and your family? See the <a href="/puppies/">available puppies</a>, or ask us and we will suggest the best match.</p>
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
<p>Vaccines are the best protection a young puppy has against serious, sometimes deadly, diseases. This guide gives the usual pattern, so you know what to expect. It is general information: your own vet decides the exact dates for your puppy, and you should always follow their advice.</p>

<h2>Why vaccinate</h2>
<p>A puppy gets some protection from its mother's milk, but that fades in the first weeks. Vaccines teach the body to fight diseases such as distemper, parvovirus, hepatitis and, in the UAE, rabies is taken very seriously. A puppy that has not finished its course is still at risk, so be careful with other dogs and places many dogs visit until your vet says it is safe.</p>

<h2>The usual schedule</h2>
<ul>
<li><strong>About 6 to 8 weeks:</strong> the first combined vaccine (often called DHPP: distemper, hepatitis, parvovirus, parainfluenza).</li>
<li><strong>About 10 to 12 weeks:</strong> the second dose.</li>
<li><strong>About 14 to 16 weeks:</strong> the third dose, which completes the puppy course.</li>
<li><strong>From about 12 weeks:</strong> the rabies vaccine, with the timing set by your vet and the local rules.</li>
<li><strong>About one year old:</strong> a booster, and after that the schedule your vet recommends, often yearly.</li>
</ul>

<h2>Deworming and parasites</h2>
<p>Puppies are usually dewormed every two weeks from a young age until about 12 weeks, then monthly until around six months, and then as your vet advises. Fleas and ticks also need a regular preventive treatment. Ask your vet which products are safe for your puppy's age and weight.</p>

<h2>Microchip and documents</h2>
<ul>
<li>A <strong>microchip</strong> identifies your puppy for life. It should be registered in your name.</li>
<li>Keep the <strong>vaccination card</strong> safe. You will need it for the vet, boarding, travel and your municipality.</li>
<li>Register your dog with your local municipality and keep its vaccinations current.</li>
</ul>

<h2>What your puppy should have when you collect it</h2>
<ul>
<li>A vaccination card with dates, vaccine names and the vet's stamp.</li>
<li>A record of deworming.</li>
<li>A microchip number, and a health certificate from a licensed vet.</li>
</ul>
<p>Every Puppyfy puppy comes with vaccinations, a microchip and documents, and we tell you what comes next. You can read more about it on our <a href="/faqs/">FAQs page</a>.</p>

<h2>Signs to call the vet at once</h2>
<p>Vomiting, bloody or watery diarrhoea, not eating, lethargy, a cough or a runny nose, or a high temperature. Young puppies get worse fast, so do not wait.</p>
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
<p>Some breeds are not easy to find in the UAE: a Bernese Mountain Dog, an Ibizan Hound, a rare colour of Border Collie. For those, a puppy is brought in from a registered breeder abroad. This guide explains the usual steps, so the process is not a mystery. The rules are set by the authorities and can change, so always confirm the current requirements before you travel or pay.</p>

<h2>Step 1: choose the breed and a trustworthy source</h2>
<p>The puppy should come from a registered breeder who raises the puppies in good conditions, shows the parents' health records, and lets you see the puppy on video. This is the most important step, because everything else depends on a healthy, well-raised dog.</p>

<h2>Step 2: the health checks and vaccinations</h2>
<p>Before the trip the puppy needs its vaccinations (including rabies, at the age the rules require), deworming and a microchip, all written in a vaccination record. A vet examines it and signs a health certificate.</p>

<h2>Step 3: the permit and the paperwork</h2>
<p>Importing a pet into the UAE normally needs an import permit from the competent authority, and the health and vaccination documents have to match the microchip number. Mistakes in these papers are the most common reason for delays at the airport.</p>

<h2>Step 4: the flight and the arrival</h2>
<p>The puppy travels with an airline that accepts animals, in an approved crate, and often in the cabin or the cargo hold in controlled conditions depending on size and the airline. On arrival, the papers are checked and the puppy is released to its new family, then delivered to your door.</p>

<h2>What can go wrong, and how to avoid it</h2>
<ul>
<li><strong>Wrong or missing documents</strong>, check them before the flight, not at the airport.</li>
<li><strong>A puppy that is too young or not fully vaccinated</strong>, the rules set minimum ages.</li>
<li><strong>Heat and stress</strong>, the airline and the time of year matter, especially in summer.</li>
<li><strong>Unreliable sellers</strong>, never send money to someone who cannot show real papers and a real puppy.</li>
</ul>

<h2>How Puppyfy helps</h2>
<p>We bring puppies in from trusted breeders and take care of the paperwork, the vet checks, the flight and the delivery, so you only choose the dog you love. See the breeds we import on the <a href="/importing/">Importing page</a>, or tell us the breed you have in mind and we will find it for you.</p>
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
<p>Summer in the UAE can reach temperatures that are dangerous for people, and dogs feel it even more. Dogs cool down mainly by panting, which works poorly in heat and humidity. Puppies, flat-faced breeds and thick-coated breeds are at the highest risk. These simple rules keep your puppy safe.</p>

<h2>Walk at the right time</h2>
<ul>
<li>Walk in the early morning and after sunset. Skip the middle of the day.</li>
<li>Keep walks short in summer, and let your puppy rest in the shade.</li>
<li>On very hot or humid days, play indoors instead.</li>
</ul>

<h2>The pavement test</h2>
<p>Put the back of your hand on the pavement or the sand for seven seconds. If it is too hot for you to hold, it is too hot for paws, and it can burn them. Walk on grass or in the shade, or wait.</p>

<h2>Water and shade, always</h2>
<ul>
<li>Carry fresh water on every walk, and offer it often.</li>
<li>At home, keep a bowl in a cool place and change it during the day.</li>
<li>If your puppy spends time on a balcony, make sure there is shade and ventilation, and never leave it there in the heat.</li>
</ul>

<h2>Never leave a dog in a car</h2>
<p>A parked car, even with the windows open and the engine off, becomes an oven within minutes. Never leave your puppy inside, not even for a short errand.</p>

<h2>Breeds that need extra care</h2>
<ul>
<li><strong>Flat-faced breeds</strong> such as the <a href="/product/pug-puppies/">Pug</a> and the <a href="/product/english-bulldog/">English Bulldog</a> struggle to breathe in heat.</li>
<li><strong>Thick-coated breeds</strong> such as the <a href="/product/huskey/">Husky</a> and the Alaskan Malamute need air-conditioned rest and gentle exercise.</li>
<li><strong>Puppies and older dogs</strong> overheat faster than healthy adults.</li>
</ul>

<h2>Signs of heatstroke: act at once</h2>
<ul>
<li>Heavy, noisy panting and a lot of drooling.</li>
<li>Bright red or very pale gums.</li>
<li>Weakness, wobbling, vomiting or collapse.</li>
</ul>
<p>If you see these, move your puppy to a cool place, offer small amounts of water, cool its body gradually with cool (not ice-cold) water, and call a vet immediately. Heatstroke is an emergency.</p>

<h2>More ways to keep cool</h2>
<ul>
<li>Keep the home air-conditioned and the puppy off the hot floor in sunny rooms.</li>
<li>Use a cooling mat in a quiet corner.</li>
<li>Ask your groomer about a summer trim for long coats, but never shave a double coat to the skin without advice.</li>
</ul>
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
<p>The Golden Retriever and the Labrador Retriever are two of the most loved family dogs in the world. Both are friendly, patient and eager to please. So how do you choose? Here are the real differences.</p>

<h2>Side by side</h2>
<ul>
<li><strong>Size:</strong> both are large, about 25 to 35 kg as adults. The Labrador is often a little stockier.</li>
<li><strong>Coat:</strong> the <a href="/product/golden-retriever-puppies-english-cream-double-coat/">Golden Retriever</a> has a longer, feathered coat that needs brushing several times a week. The <a href="/product/black-labrador-puppies/">Labrador</a> has a short, dense coat that is easy to care for, though it still sheds.</li>
<li><strong>Energy:</strong> both are active and need daily exercise. Labradors are often a little more boisterous and keen on water and food.</li>
<li><strong>Temperament:</strong> goldens are gentle and sensitive. Labradors are cheerful, outgoing and sometimes more rowdy as youngsters.</li>
<li><strong>Training:</strong> both are very trainable and love to please. A Labrador's love of food makes treat training easy, but it also needs watching for weight gain.</li>
<li><strong>Lifespan:</strong> usually 10 to 12 years.</li>
</ul>

<h2>Which copes better with the UAE climate?</h2>
<p>Both need care in the heat. The Labrador's short coat is easier to keep cool, while the Golden Retriever needs more careful grooming and shade. For either breed, walk early or late, give plenty of water and keep them in the air-conditioning in the middle of the day.</p>

<h2>Colours and choices</h2>
<p>Labradors come in black, chocolate and cream: see the <a href="/product/black-labrador-puppies/">black</a>, <a href="/product/chocolate-labrador-puppies/">chocolate</a> and <a href="/product/creamy-labradore-puppies/">creamy</a> Labrador puppies. Goldens range from deep gold to the pale English cream.</p>

<h2>Choose a Golden Retriever if you...</h2>
<ul>
<li>want a gentle, soft-natured family companion,</li>
<li>enjoy grooming and a flowing coat,</li>
<li>have time for daily walks and play.</li>
</ul>

<h2>Choose a Labrador if you...</h2>
<ul>
<li>want a cheerful, athletic friend who loves games and water,</li>
<li>prefer an easy-care coat,</li>
<li>can manage a big, strong puppy and keep a careful eye on its food.</li>
</ul>
<p>You cannot go far wrong with either. Whichever you choose, give it time, training and company. See the available puppies on our <a href="/puppies/">puppies page</a>.</p>
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
<p>When you shop for a Pomeranian, a Poodle, a Yorkie or a Chihuahua you will see the words <em>teacup</em>, <em>toy</em> and <em>mini</em>. They are popular, but they can be confusing. Here is the honest explanation.</p>

<h2>These words are not official breed standards</h2>
<p>Kennel clubs set one standard for each breed. "Toy" is an official group for the smallest breeds, but "teacup" and "mini" are marketing words that breeders and sellers use for puppies expected to stay smaller than average. There is no international rule that says exactly how small a teacup dog is.</p>

<h2>What they usually mean</h2>
<ul>
<li><strong>Toy:</strong> the smaller size of a breed, for example the <a href="/product/apricot-chocolate-red-toy-poodle/">Toy Poodle</a> (usually under about 4 kg as an adult).</li>
<li><strong>Mini:</strong> a size between toy and standard, or a smaller-than-average version, for example a <a href="/product/mini-yorkie-puppies/">mini Yorkie</a>.</li>
<li><strong>Teacup:</strong> the smallest, often just 1 to 2.5 kg as an adult, depending on the breed.</li>
</ul>

<h2>Important: no one can promise an exact adult size</h2>
<p>A puppy's adult size depends on its parents and its growth. A trustworthy seller shows you the parents or tells you their weight, gives an expected adult weight range and never promises an exact number.</p>

<h2>Health points about very small dogs</h2>
<ul>
<li>Very small puppies can have low blood sugar, so they need small, regular meals.</li>
<li>Their bones and teeth are delicate: jumping from the sofa can hurt them, and dental care matters.</li>
<li>They get cold and overheat more quickly, and they need careful handling around children.</li>
</ul>
<p>Small is not "better". A healthy puppy of a normal size for its breed is often the wiser choice, especially for families with young children.</p>

<h2>Questions to ask the seller</h2>
<ul>
<li>How much do the parents weigh?</li>
<li>What adult weight range do you expect for this puppy?</li>
<li>How old is the puppy, and has a vet checked it?</li>
<li>What vaccinations, microchip and health certificate come with it?</li>
</ul>

<h2>Find your size at Puppyfy</h2>
<p>On our <a href="/puppies/">Available puppies page</a> you can filter by size: Teacup, Toy, Mini, Small, Medium, Large and Giant. Several breeds come in more than one size, for example the Poodle, the Pomeranian, the Yorkie and the Chihuahua.</p>
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
<p>You have found a puppy you love. Before you say yes, spend ten minutes on this checklist. It protects the puppy and it protects you from heartbreak and vet bills.</p>

<h2>The 10 checks</h2>
<ol>
<li><strong>Bright, clear eyes.</strong> No heavy discharge, redness or cloudiness.</li>
<li><strong>Clean ears and nose.</strong> No bad smell, scratching or constant sneezing or coughing.</li>
<li><strong>A healthy coat and skin.</strong> No bald patches, sores, fleas or dandruff.</li>
<li><strong>Good body condition.</strong> Not too thin or with a swollen belly. You should be able to feel the ribs lightly under a thin layer of flesh.</li>
<li><strong>Clean teeth and pink gums.</strong> Pale gums can mean a problem.</li>
<li><strong>Normal movement.</strong> Walking and playing without limping, wobbling or pain.</li>
<li><strong>A friendly, curious character.</strong> A puppy that is not terrified, not frozen and not fighting everything. Some shyness is normal, but extreme fear is not.</li>
<li><strong>The right age.</strong> Not under about 8 weeks. Puppies taken too young have more health and behaviour problems.</li>
<li><strong>The papers.</strong> A vaccination card with dates and a vet's stamp, deworming record, microchip number and a health certificate.</li>
<li><strong>A seller you can trust.</strong> They answer questions, show where the puppy was raised, let you see or video call the puppy and its parents' details, and do not hurry you.</li>
</ol>

<h2>Questions to ask</h2>
<ul>
<li>What has the puppy eaten, and how often?</li>
<li>Which vaccines has it had, and what is the next one due?</li>
<li>What size will it be as an adult?</li>
<li>What happens if the vet finds a health problem in the first days?</li>
</ul>

<h2>Take it to a vet</h2>
<p>Book a visit in the first days after you bring your puppy home. It is the best way to confirm its health and plan the next vaccines.</p>

<h2>Red flags</h2>
<ul>
<li>No papers, or papers that do not match the microchip.</li>
<li>A very low price for a rare breed.</li>
<li>A seller who will not show the puppy or tell you where it comes from.</li>
<li>Many different breeds for sale at once with no clear source.</li>
</ul>
<p>At Puppyfy, every puppy is checked and comes with vaccinations, a microchip and documents. Browse the <a href="/puppies/">available puppies</a> and ask us anything you want to know before you decide.</p>
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
<p>The first week with a new puppy is exciting and tiring. Everything is new to your puppy: a new home, new smells, new people. A calm, predictable routine helps it settle quickly.</p>

<h2>Before the puppy arrives</h2>
<ul>
<li>A bed or crate in a quiet corner, away from the sun and the direct air-conditioner blast.</li>
<li>Food and water bowls, and the food the puppy is eating now (keep it the same for the first days).</li>
<li>A collar, a lead and an ID tag with your phone number.</li>
<li>Toilet-training pads or access to a safe outdoor spot.</li>
<li>Safe chew toys, and a soft toy for company.</li>
<li>Puppy-proof the home: hide wires, shoes and small objects, and block stairs and balcony gaps.</li>
</ul>

<h2>Day one</h2>
<ul>
<li>Let the puppy explore one room at a time, and keep it calm. Do not invite many visitors yet.</li>
<li>Offer water and a small meal, and show it the toilet spot.</li>
<li>Expect crying at night. A warm bed, a soft toy and a quiet room usually help.</li>
</ul>

<h2>Feeding</h2>
<ul>
<li>Young puppies usually eat three to four small meals a day. Ask the seller or your vet for the right amounts for its breed and age.</li>
<li>Change the food slowly, over about a week, if you want to switch brands.</li>
<li>Never give chocolate, grapes or raisins, onions, cooked bones or sweets. They are dangerous to dogs.</li>
</ul>

<h2>Toilet training</h2>
<ul>
<li>Take the puppy to the toilet spot after waking, after eating, after playing and every couple of hours.</li>
<li>Praise and reward each success. Never punish accidents: clean them with an enzyme cleaner and carry on.</li>
</ul>

<h2>Sleep and rest</h2>
<p>Puppies sleep a lot, up to 18 hours a day. Let it rest after play, and keep young children from waking it constantly.</p>

<h2>The first vet visit</h2>
<p>Book it in the first days. Bring the vaccination card and the microchip number. The vet will check the puppy and plan the next vaccines and deworming. Read more in our <a href="/puppy-vaccination-schedule-in-the-uae-what-to-give-and-when/">vaccination schedule guide</a>.</p>

<h2>Gentle socialisation</h2>
<p>Introduce new people, sounds and surfaces slowly and positively. Until the vaccines are complete, avoid places where many unknown dogs go, and ask your vet about safe ways to socialise.</p>

<h2>Be patient</h2>
<p>Every puppy settles at its own speed. A few weeks of calm routine, training and affection build a happy, confident dog for life.</p>
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
<p>The Pomeranian is small, fluffy and full of personality. It is one of the most popular small breeds in the UAE, and for good reason. This guide explains how to keep a Pomeranian healthy and happy.</p>

<h2>Temperament</h2>
<p>Poms are lively, bold, curious and loyal to their family. They are clever and love to learn, but they can also be stubborn and vocal. Early training and gentle socialisation make a friendly, confident dog and keep barking under control. Because they are tiny, supervise them with young children and larger dogs.</p>

<h2>Size</h2>
<p>An adult Pomeranian is usually about 2 to 3.5 kg and 18 to 24 cm tall. They also come in mini and teacup sizes: see our guide to <a href="/teacup-toy-and-mini-puppies-what-the-sizes-really-mean/">what the sizes really mean</a>.</p>

<h2>The double coat</h2>
<p>A Pomeranian has a soft, dense undercoat and a longer outer coat. It looks magnificent and it needs regular care.</p>
<ul>
<li><strong>Brush two to three times a week</strong>, and daily when it sheds its undercoat. Use a pin brush or a slicker brush, and a comb for the thick areas behind the ears and on the trousers.</li>
<li><strong>Bathe every three to four weeks</strong> with a dog shampoo, and dry it fully, so skin problems do not start under the thick coat.</li>
<li><strong>Do not shave the coat.</strong> A double coat protects from heat and sun, and shaving can damage its regrowth. A light tidy trim is fine.</li>
</ul>

<h2>Keeping a Pomeranian cool in the UAE</h2>
<ul>
<li>Walk early in the morning or after sunset, and keep walks short in summer.</li>
<li>Keep it indoors in the air-conditioning during the heat of the day.</li>
<li>Provide shade and fresh water everywhere, and never leave it in a car.</li>
</ul>

<h2>Exercise</h2>
<p>Two short walks and some play every day are enough. Poms enjoy games and learning tricks, which also keeps them from getting bored.</p>

<h2>Health points</h2>
<ul>
<li><strong>Teeth:</strong> small dogs get dental problems early. Brush the teeth several times a week and ask your vet about checks.</li>
<li><strong>Weight:</strong> keep it slim. Extra weight strains the small legs and the knees.</li>
<li><strong>Knees and windpipe:</strong> use a harness, not just a collar, and avoid high jumps.</li>
<li><strong>Regular vet visits</strong> for vaccines, parasite prevention and check-ups.</li>
</ul>

<h2>Feeding</h2>
<p>Small meals of a good-quality small-breed food, as your vet advises. Avoid too many treats.</p>
<p>Meet the Pomeranian puppies we have today on the <a href="/product/white-pomeranian-puppies/">Pomeranian page</a>, or see our <a href="/puppies/">full list of puppies</a>.</p>
${WA}
`,
  },
];
