"""Narration-to-visual scene plan.

Each beat is anchored to an exact phrase of the (romanised Telugu) script. The
compiler (build_timeline.py) resolves each anchor to the aligned timestamp of
its first word, so every visual change lands on the spoken phrase it illustrates.

Kinds
  S  stock footage (Pixabay)           -> footage-dominant
  P  real photograph (Wikimedia etc.)  -> photo-dominant
  G  motion graphics / 3D              -> graphics-dominant
Overlays on S/P beats never change their classification.

`en` = concise English meaning of what is being said (used for the scene plan,
never displayed as a transliteration).
"""

BEATS = []


def S(anchor, q, ov=None, en='', off=0.0, look=None):
    BEATS.append(dict(kind='stock', anchor=anchor, q=q, ov=ov, en=en, off=off, look=look))


def P(anchor, img, ov=None, en='', off=0.0, mode='kenburns'):
    BEATS.append(dict(kind='photo', anchor=anchor, img=img, ov=ov, en=en, off=off, mode=mode))


def G(anchor, comp, en='', off=0.0, three=False, tail=None, kind=None, **props):
    """tail=(seconds, [queries], overlay) hands the remainder of the beat to real footage."""
    BEATS.append(dict(kind=kind or ('3d' if three else 'mg'), anchor=anchor, comp=comp, props=props, en=en, off=off, tail=tail))


def loc(text, sub=None):
    return dict(t='loc', text=text, sub=sub)


def stat(value, label, source=None, tone='blue', prefix='', suffix=''):
    return dict(t='stat', value=value, label=label, source=source, tone=tone, prefix=prefix, suffix=suffix)


def kicker(text, sub=None, tone='light'):
    return dict(t='kicker', text=text, sub=sub, tone=tone)


def question(text, sub=None):
    return dict(t='question', text=text, sub=sub)


def note(text):
    return dict(t='note', text=text)


# ───────────────────────────── OPENING ─────────────────────────────
G('mee phone lo whatsapp status', 'PhoneStatus', en='On your phone, in a friend\'s status — someone has settled in Canada.')
S('canada lo settle ayyi', ['toronto winter snow street', 'snowy city street night lights', 'winter city snow evening'],
  en='They post status after status from Canada.')
G('settle ayipoyi photo la meedha', 'PhotoStack', en='Photo after photo.')
S('maa vaadini kuda edolaa', ['indian family mobile phone', 'indian mother phone', 'family looking at smartphone'],
  en='Relatives ask: "Get our boy there somehow too."')
S('nijanga mana 90s middle class', ['indian parents home', 'indian family living room', 'elderly indian couple'],
  en='For 90s middle-class parents, a child settled abroad brings security and pride.')
S('settle ayithe vache securty', ['indian wedding celebration', 'indian family celebration', 'indian festival family'],
  en='Unmatched pride and security.')
S('chuttala mundu parents rrespect', ['indian function guests', 'indian relatives gathering', 'indian ceremony people'],
  en='Respect for the parents rises overnight at every function.')
G('ayithe ee canada foreign setttlement', 'PostcardTear', en='But behind this Canada settlement there is a dark side.')
P('columbia loni surrey city', 'surrey_city_centre_2026', ov=loc('SURREY', 'BRITISH COLUMBIA'),
  en='In Surrey, British Columbia...')
S('chesthunna 26 years kurraadu', ['mobile phone shop', 'phone repair shop', 'electronics store counter'],
  ov=dict(t='profile', lines=['AGE 26', 'FROM KHAMMAM, TELANGANA', 'BEHIND A PHONE-SHOP COUNTER']),
  en='...a 26-year-old from Khammam works behind a small phone-shop counter.')
G('vellaadu college lo admission', 'DocTally', en='Came on a study visa, enrolled in college — never attended a single class.')
S('full-time aa shop lone pani', ['counting cash money hands', 'cash payment hands', 'counting dollar bills'],
  ov=stat('7', 'Canadian dollars an hour — paid in cash', 'As reported by The Times of India', tone='coral', prefix='C$'),
  en='Full-time in that shop, paid cash — just 7 Canadian dollars an hour.')
S('toronto lo ongole nunchi', ['food delivery bicycle night', 'delivery rider city', 'courier bike winter city'],
  ov=dict(t='profile', lines=['AGE 25', 'FROM ONGOLE, ANDHRA PRADESH', 'DELIVERY RIDER, TORONTO']),
  en='In Toronto, a 25-year-old from Ongole works as a delivery agent.')
G('ee iddari kathalu times of india', 'SourceCard', tail=(2.6, ['newspaper reading', 'reading news phone', 'newspaper closeup'], None),
  outlet='The Times of India', line='Both accounts were reported by The Times of India.',
  en='Both are real stories reported by The Times of India.')
G('mana whatsapp groups lo chuse', 'PostcardCrack', tail=(4.5, ['phone photo scrolling', 'smartphone gallery scrolling', 'phone screen photos'], None), en='Can we say there is no such struggle behind every "Settled bro" photo?')
S('struggle ledhani cheppagalama', ['lonely man window night', 'sad man looking out window', 'young man alone night city'],
  en='Can we really say there is no struggle?', off=-0.6)
G('2026 november 5 na canada government', 'GovAnnouncement', kind='doc', en='On 5 November 2026 the Government of Canada made a big announcement.')
S('last two years ga immigration cut', ['airport passport control', 'airport immigration queue', 'passport check airport'],
  en='After two years of cutting immigration and tightening visa rules...')
G('students ki doors close', 'Door3D', three=True, state='closing', en='...the government that seemed to shut its doors on Indian students...')
S('canada lo already unna temporary', ['toronto crowd street', 'city crowd walking winter', 'people walking downtown'],
  ov=stat('200,000', 'temporary residents already in Canada — a chance at PR by end-2027', 'IRCC, 5 Nov 2026', prefix='UP TO '),
  en='...now offers about 200,000 temporary residents already in Canada a chance at PR by the end of 2027.')
G('ending lopu pr iche chance', 'ExtraBlock', tail=(4.5, ['canada immigration documents', 'passport desk documents', 'documents passport'], None), en='On top of the regular quota.')
G('entante ide 2026 first seven', 'IndianDropTeaser', tail=(7.0, ['indian students group', 'young indian people walking', 'indian youth group'], None), en='The twist: Indians getting PR fell by ~15,000 in Jan–Jul 2026; two of every three seats cut were Indian.')
S('mari canada mana kosam doors', ['canadian flag waving', 'canada flag wind', 'flag of canada'],
  ov=question('Is Canada opening its doors to Indians —', 'or shutting them in our face?'),
  en='So is Canada opening its doors for us, or closing them?')
G('ee video lo canada craze', 'ChapterMenu', tail=(3.6, ['canada maple leaf autumn', 'autumn maple leaves', 'maple leaf red'], None), en='How the craze began, the U-turn, why Indians were hit, ground reality, the 200,000 PR plan.')
S('2 lakh pr venakala game', ['toronto night aerial', 'city skyline night aerial', 'downtown night drone'],
  en='...and the game behind the new 200,000 PR plan.')
S('chivarlo moodu questions', ['person thinking dark', 'man thinking silhouette', 'contemplative person window'],
  ov=kicker('Three questions at the end.', 'None of them easy to answer.'),
  en='Three questions at the end — not easy to answer.')

# ───────────────────────────── 1. THE FORMULA ─────────────────────────────
S('1 the formula', ['passport boarding pass', 'boarding pass airport', 'airport departure board'], ov=dict(t='chapter', num='01', title='The Formula', sub='How the Canada craze began'))
S('story start chese mundhu', ['american university campus', 'university campus usa', 'college campus students walking'],
  en='Truth first: Canada was never Telugu families\' first choice — America was.')
G('ten years back hyderabad', 'IndiaMapCities', en='Ten years ago in Hyderabad, Vijayawada, Guntur...')
S('guntur lo ye middle-class intlo', ['indian engineering students', 'indian graduates graduation', 'indian college students'],
  en='"After B.Tech, where will the boy go?" — one answer: the US.')
G('okate answer us kaani america', 'LotteryDraw', tail=(5.5, ['graduation caps thrown', 'masters graduation', 'graduates ceremony'], dict(t='kicker', text='Master\'s degree. Job offer.', sub='H-1B selection still comes down to a lottery.')), en='But America has a headache: the H-1B lottery. Masters, job offer — still pure luck.')
S('h-1b vachina indians ki green', ['man waiting queue office', 'waiting room people', 'man waiting clock'],
  ov=kicker('Even with an H-1B, Indian nationals face decades-long green-card backlogs.'),
  en='Even with H-1B, Indians wait decades for a green card.')
S('sarigga aa frustration lone', ['frustrated student laptop', 'stressed student night', 'young man stressed laptop'],
  en='Right in that frustration, another country\'s name reached our ears...')
G('lottery tension leni peaceful', 'JourneyMap3D', three=True, en='...a peaceful country with no lottery: Canada.')
G('maths formula laantidhi', 'StudyToPR', tail=(10.5, ['graduates celebrating', 'citizenship ceremony', 'happy graduate'], None), en='The offer was a formula: study 1–2 years, get a PGWP, work a year, collect points, get PR, then citizenship.')
S('paniledhu just formula', ['math formula blackboard', 'student writing equations', 'chalkboard equations'],
  en='No lottery, no luck — just a formula. We grew up memorising formulas; we loved this one.')
S('inkemundhi numbers pelipoyaayi', ['airport departure crowd', 'airport terminal travelers', 'airplane boarding passengers'],
  ov=stat('226,000+', 'Indian students arrived in Canada in 2022 — No. 1 source country', 'IRCC study permit data'),
  en='In 2022 India was No. 1 among new international students — over 2.26 lakh.')
S('2023 lo daadapu 1.4 lakh', ['happy indian couple', 'indian family happy outdoors', 'celebration family success'],
  ov=stat('~140,000', 'Indians became permanent residents in 2023 — the decade\'s highest', 'IRCC, 2023'),
  en='In 2023, about 1.4 lakh Indians got PR — highest in ten years.')
G('kotthaga pr vachina prati naluguri', 'WaffleShare', tail=(4.8, ['indian family airport', 'family airport arrival', 'airport arrivals hugging'], None), en='Roughly one of every four new PRs was Indian.')
P('ameerpet lo prati floor', 'ameerpet_02', ov=loc('AMEERPET', 'HYDERABAD'), en='In Ameerpet, a consultancy board lit up on every floor.')
S('families oorlo polalu ammesaaru', ['india farmland aerial', 'farmer field india', 'agricultural land india'],
  en='Families sold farmland back home...')
G('20 30 ekanga 40 lakhs', 'LoanStack', en='...and took loans of ₹20, 30, even 40 lakh.')
G('polam ammi 40 lakhs appu', 'FinancialTrap3D', three=True, en='Sell land, borrow ₹40 lakh, send the son for a one-year diploma...')
S('mechukunnaru endukante appudu', ['indian graduation celebration', 'proud parents graduation', 'graduation ceremony family'],
  en='...and everyone called it a wise decision — because back then, it really worked.')
G('ye country aa formula raasindho', 'FormulaTear', tail=(5.0, ['paper trash bin', 'crumpled paper bin', 'torn paper'], None), en='The country that wrote the formula tore it up and threw it in the bin.')

# ───────────────────────────── 2. THE GREAT U-TURN ─────────────────────────────
S('2 the great u-turn', ['road u turn', 'highway road aerial', 'car u turn road'], ov=dict(t='chapter', num='02', title='The Great U-Turn', sub='From 500,000 to a freeze'))
P('2024 varaku canada government target', 'parliament_hill', ov=loc('PARLIAMENT HILL', 'OTTAWA'),
  en='Until 2024, Ottawa\'s target was 5 lakh PRs a year.', off=1.0)
G('two years lone aa plan', 'PolicyTimeline', tail=(10.5, ['ottawa parliament', 'government building canada', 'parliament building'], dict(t='stat', value='380,000', label='permanent residents a year — frozen through 2029', source='IRCC Levels Plan 2027–2029', tone='blue', prefix='', suffix='')), en='Within two years the plan was scrapped: 483,640 (2024) → ~393,500 (2025) → 380,000 target, frozen to 2029.')
S('pr iche paatha formula', ['nurse hospital', 'healthcare worker hospital', 'nurse patient care'],
  ov=dict(t='chips', items=['HEALTHCARE', 'SKILLED TRADES', 'FRENCH SPEAKERS', 'CANADIAN WORK EXPERIENCE'], title='NEW PRIORITY'),
  en='Priority now: healthcare workers, tradespeople, French speakers, Canadian work experience.')
G('provinces ki ekkuva power', 'ProvinceMap', en='Provinces got more power — nominations raised to 95,000 a year.')
S('simple ga cheppalante canada', ['small town canada', 'rural town aerial winter', 'small town main street'],
  en='Canada no longer wants everyone — only certain places, jobs and people.')
G('meeru 24 years age lo', 'ApplicantProfile', tail=(5.0, ['student laptop disappointed', 'sad student laptop', 'young man laptop worried'], None), en='Age 24, a generic one-year business diploma, no French — not good news.')
S('kaadhu innnellu randi randi', ['car brake lights traffic', 'traffic jam brake lights', 'car stopping snow'],
  en='Why did a country that kept saying "come, come" suddenly pull the handbrake?')
G('naalugu reasons unnaayi', 'FourReasons', en='Four reasons. The fourth is uncomfortable to hear.')

# ───────────────────────────── 3. WHY CANADA HIT THE BRAKES ─────────────────────────────
S('3 why canada hit the brakes', ['car brake stop', 'stop sign snow', 'red traffic light snow'], ov=dict(t='chapter', num='03', title='Why Canada Hit the Brakes', sub='Housing · Public mood · Jobs · Fraud'))
S('first reason illu housing crisis', ['construction crane city', 'building construction site crane', 'apartment construction'],
  ov=dict(t='reason', n='01', text='HOUSING'),
  en='Reason one: housing. Population grew faster than homes were built.')
S('fast ga perigipoyindhi greater toronto', ['suburban houses aerial', 'residential neighborhood aerial', 'houses suburb drone'],
  ov=stat('1M', 'average home price in the Greater Toronto Area — roughly 9× family income (as stated)', 'Narration figure — see fact-check', prefix='C$', suffix='+'),
  en='In the GTA the average house price crossed C$1 million — about 9× family income.')
S('ekkuva illu hospitals catch', ['hospital waiting room', 'hospital corridor', 'emergency room hospital'],
  en='Government says growth must slow so housing and hospitals can catch up.')
G('kaani canada government ye chesina', 'HousingStudy', kind='doc', en='But a government study: immigration explains only ~11% of 2006–2021 price rises.')
G('percent maathrame kaaranam migatha', 'HousingCity3D', three=True, tail=(6.5, ['real estate sold sign', 'house for sale sign', 'interest rate mortgage'], None), en='The rest: interest rates, zoning, investors, decades of under-building.')
S('immigrants ekkuvaga kanipinche face', ['crowd people street blur', 'busy street pedestrians', 'crowd walking city'],
  en='Immigrants are just the most visible face — not the main cause.')
G('second reason public mood', 'SurveyChart', tail=(6.6, ['people street canada winter', 'pedestrians crossing street', 'crowd crossing'], None), en='Reason two: public mood. Late 2024, 54% said too many immigrants were coming.')
S('sagaaniki paiga janalu', ['protest crowd signs', 'rally crowd street', 'political rally crowd'],
  en='When over half think so, every party has to listen.')
S('third reason jobs mukhyamga', ['job fair young people', 'young people job interview', 'job seekers'],
  ov=dict(t='reason', n='03', text='JOBS'), en='Reason three: jobs — especially for youth.')
S('2026 april lo youth unemployment', ['young man job search laptop', 'unemployed young man', 'young woman job search'],
  ov=stat('14.3%', 'youth (15–24) unemployment, April 2026', 'Statistics Canada, Labour Force Survey'),
  en='Youth unemployment hit 14.3% in April 2026.')
S('statistics canada maaji chief', ['fast food restaurant worker', 'restaurant kitchen workers', 'cashier fast food'],
  ov=kicker('Fraser Institute study (by a former StatCan chief economist):', 'newcomers compete directly with local youth for entry-level jobs.'),
  en='A Fraser Institute study argues newcomers competed with local youth in restaurants, retail, gas stations.')
S('newcomers direct ga local youth', ['gas station attendant', 'retail store cashier', 'supermarket cashier'],
  en='Entry-level jobs: restaurants, retail, gas stations.')
S('vere analysts maathram', ['business district office workers', 'office workers walking', 'shipping containers port'], ov=dict(t='kicker', text='Other analysts: the link isn\'t proven.', sub='Weak hiring and trade uncertainty also played a big part.'), en='Other analysts: the link isn\'t proven; weak hiring and trade uncertainty matter too.')
G('fourth reason fraud', 'FraudLetter', en='Reason four: fraud — fake admission letters, paper-only colleges, students who never attend.')
S('bogus colleges enroll ayyi', ['empty classroom', 'empty lecture hall', 'empty school desks'],
  en='Canada cracked down on all of it.')
G('down chesindhi result ga', 'RefusalBars', tail=(7.0, ['visa application rejected', 'rejected stamp document', 'denied stamp'], None), en='Aug 2025: ~74% of Indian study-permit applications refused — vs 32% two years earlier; overall ~40%.')
S('chala mandhi marchipoye point', ['college building campus', 'university building exterior', 'campus building'],
  en='What many forget: Canada built this system.')
G('fees tho colleges sampadhinchaayi', 'MoneyFlow', tail=(4.5, ['college students lecture hall', 'lecture hall students', 'classroom students'], None), en='Colleges earned on international fees; governments set big targets and approved permits.')
S('system overheat ayinappudu', ['stressed student head in hands', 'student stress exam', 'worried young woman'],
  en='When the system overheated, the bill fell on the least powerful — students.')
S('idhi thappulu sarichesukovadama', ['dark city rain night', 'rain window night', 'city night rain street'],
  ov=question('Fixing mistakes —', 'or making someone else pay for them?'),
  en='Is this correcting mistakes, or sacrificing others?')

# ───────────────────────────── 4. WHY INDIANS TOOK THE BIGGEST HIT ─────────────────────────────
S('4 why indians took the', ['india flag', 'indian crowd street', 'delhi street'], ov=dict(t='chapter', num='04', title='Why Indians Took the Biggest Hit', sub='Pipeline, not targeting'))
G('intro lo cheppukunna 15,000', 'IndianPRCompare', tail=(8.0, ['indian people crowd', 'indian community event canada', 'indian diaspora'], dict(t='stat', value='−15,405', label='fewer Indians granted PR, Jan–Jul 2026 vs 2025', source='IRCC monthly PR data', tone='coral')), en='Jan–Jul 2025: 68,690 Indians got PR; Jan–Jul 2026: 53,285.')
G('ade time lo canada total', 'CutShare', tail=(5.0, ['immigration office', 'government office queue', 'office paperwork'], None), en='Total PR intake fell ~24,000 — 64% of the seats cut were Indian.')
S('students vaipu chusthe', ['international students winter campus', 'students snow campus', 'students walking snow'],
  ov=stat('−66%', 'new study permits vs 2023 (as cited) · Apr 2024 → Apr 2026: more than −80%', 'Narration figures — see fact-check', tone='coral'),
  en='Students fared worse: new study permits down 66% vs 2023.')
S('mari canada kaavalane indians', ['passport documents desk', 'passport visa application', 'immigration documents'],
  en='So is Canada deliberately targeting Indians? Set emotion aside.')
S('honestly matladali official data', ['canadian passport', 'passport stamp', 'passport closeup'],
  ov=kicker('No rule in the official data targets Indians.'),
  en='There is not a single rule written against Indians in the official data.')
G('reason simple and harsh', 'PipelineFlow', tail=(7.5, ['water pipe flowing', 'water flowing pipe', 'water stream narrow'], None), en='Simple and harsh: Indians are the biggest group in the pipeline. Narrow the pipe and the biggest flow is hit hardest.')
S('parallel ga diplomacy layer', ['india flag waving', 'indian flag wind', 'flag india'], ov=dict(t='kicker', text='Meanwhile: the diplomatic layer.', sub='India–Canada relations, 2023 → 2026'), en='In parallel, a diplomatic layer.')
P('trudeau hardeep singh nijjar', 'trudeau_2023',
  ov=dict(t='person', name='Justin Trudeau', role='Prime Minister, Sept 2023', note='Alleged links between Indian agents and the killing of Hardeep Singh Nijjar'),
  en='Sept 2023: Trudeau alleged Indian agents were behind Nijjar\'s killing.')
G('allegation vesaaru india nijjar', 'DiplomaticFreeze', tail=(5.0, ['embassy building flags', 'consulate building', 'diplomat building flags'], None), en='India rejected it, calling Nijjar a terrorist; diplomats expelled, visa services halted, relations frozen.')
P('mark carney pm ayyaaka', 'carney_2025', ov=dict(t='person', name='Mark Carney', role='Prime Minister since March 2025'),
  en='After Mark Carney became PM, things changed.')
P('g7 summit ki pm modi', 'modi_carney_g7_2025', ov=dict(t='person', name='G7 Summit, Kananaskis', role='June 2025 · High Commissioners later restored'),
  en='Modi invited to the June 2025 G7; High Commissioners returned.')
P('2026 march lo carney delhi', 'modi_carney_2026', ov=dict(t='person', name='New Delhi, March 2026', role='Trade target: US$50 billion by 2030'),
  en='March 2026: Carney in Delhi, a "fresh start" with a $50B trade target by 2030.')
S('fresh start gurinchi matlaadaaru diplomats', ['business handshake', 'handshake meeting', 'formal handshake'],
  ov=kicker('Diplomats shook hands.', 'Immigration numbers did not rise.'),
  en='Diplomats shook hands, but immigration numbers did not rise.')
S('immigration numbers peragaledhu', ['toronto city street people', 'downtown toronto', 'city street winter people'],
  en='These cuts come from internal pressure, not diplomacy.', off=1.2)
S('internal pressure valla vachaayi', ['work permit document', 'documents paperwork desk', 'paperwork stack desk'],
  en='And that pressure shows on the permits of lakhs already there.')

# ───────────────────────────── 5. THE WORK PERMIT CLIFF ─────────────────────────────
S('5 the work permit cliff', ['clock countdown', 'hourglass sand', 'calendar countdown'], ov=dict(t='chapter', num='05', title='The Work Permit Cliff', sub='When status runs out'))
S('ippati daaka canada vellalanukune', ['young indian man walking city', 'south asian man street', 'man walking winter street'],
  en='Now, those already there — their time is running out.')
S('akkade unna vaalla gurinchi vaallaki', ['clock ticking', 'calendar pages', 'clock time passing'],
  en='Their time is running out.', off=1.2)
G('work permits oke sari icchaaru', 'PermitCliff3D', three=True, phase=1, tail=(9.0, ['office documents stack', 'paperwork pile', 'files documents office'], None),
  en='Permits issued in a boom now expire together: ~1.05M expired by end-2025; ~927,000 more in 2026.')
S('2026 first three months lone', ['calendar flipping', 'calendar desk', 'calendar planning'], ov=dict(t='stat', value='314,538', label='work permits set to expire in Jan–Mar 2026 alone — a record quarter', source='IRCC data released via ATIP (as reported)', tone='coral'), en='Over 3.1 lakh in Q1 2026 alone — a record.')
G('permit ayipoyi pr gaani', 'ThreePaths', tail=(6.5, ['man suitcase walking', 'man leaving home suitcase', 'traveler alone'], None), en='Without PR or another visa: leave, apply and wait, or stay without legal status.')
S('immigration consultant anchana prakaram', ['immigration office consultant', 'office meeting documents', 'consultant desk meeting'],
  ov=dict(t='estimate', text='About half of those affected are Indian', sub='One immigration consultant\'s estimate — not official data'),
  en='One immigration consultant estimates about half of those affected are Indians.')
G('decades tharvaatha first time', 'TRPopulation', tail=(7.0, ['people walking city canada', 'busy street toronto', 'pedestrians winter coats'], None), en='For the first time in decades, the temporary-resident count is falling: 3.15M → 2.56M.')
S('drop lo 30 percent pr', ['airport suitcase departure', 'traveler suitcase airport', 'luggage airport walking'],
  ov=stat('30%', 'of the drop: people who switched to PR. Many others packed up and left.', 'As stated in narration'),
  en='30% of the drop moved to PR; many of the rest packed their bags and left.')
P('status lekunda entha mandhi', 'parliament_hill',
  ov=kicker('How many stayed on without status?', 'Canada has no official count.'),
  en='How many stayed on without status? Canada has no answer.', off=0.0, mode='dark')
S('sare akkade unna vaalla', ['phone photo snow', 'taking photo smartphone city', 'smartphone photo city'],
  en='So what is daily life like? The story behind the photo.')

# ───────────────────────────── 6. THE LIFE BEHIND THE PHOTO ─────────────────────────────
S('6 the life behind the photo', ['polaroid photos', 'old photographs table', 'photos table'], ov=dict(t='chapter', num='06', title='The Life Behind the Photo', sub='Jobs · Rent · Our own story'))
G('photo lo snow coffee cup', 'ThroughPhoto3D', three=True, en='In the photo: snow, coffee cup, CN Tower. Outside the photo?')
S('first struggle jobs', ['job search newspaper', 'resume job application', 'job interview waiting'],
  ov=stat('6.7%', 'unemployment, Oct 2026 · youth (15–24): 13.7%', 'Statistics Canada, LFS Oct 2026'),
  en='Struggle one: jobs. Oct 2026 unemployment 6.7%; youth 13.7%.')
G('ee year april lo student', 'OneInSix', tail=(5.5, ['students job board', 'student looking job', 'job search young woman'], None), en='April: student unemployment 16% — one in six job-seeking students can\'t find work.')
S('walmart gas stations lo part-time', ['barista coffee shop', 'coffee shop worker', 'cafe barista'],
  en='They compete for part-time jobs at coffee chains, big-box stores, gas stations.')
S('thone mana vaallathone poti', ['supermarket cashier', 'grocery store worker', 'retail worker shelves'],
  en='Against other international students — and our own people.')
S('kotthaga vachina immigrants locals', ['delivery rider night city', 'food delivery scooter', 'delivery courier rain'],
  ov=stat('8%', 'of recent immigrants rely on gig platforms vs 1.5% of Canadian-born', 'As stated in narration', suffix=' vs 1.5%'),
  en='Recent immigrants depend on gig apps five times more: 8% vs 1.5%.')
S('second struggle rent', ['apartment building exterior', 'apartment towers city', 'residential tower'],
  en='Struggle two: rent.')
G('median rent nelaki 2,150', 'RentInvoice', tail=(5.0, ['apartment interior small', 'small apartment room', 'studio apartment'], None), en='Sept 2026: Toronto one-bedroom median C$2,150/month — about ₹1.3 lakh.')
S('expenses lo 68 percent', ['rent payment', 'paying bills laptop', 'calculator bills'], ov=dict(t='stat', value='68%', label='of monthly expenses in Toronto go to rent (as stated)', source='Narration figure — see fact-check', tone='coral'), en='68% of monthly expenses go to rent.')
S('rents konchem thagguthunnai', ['for rent sign', 'apartment for rent', 'rental apartment'],
  ov=kicker('Rents are easing —', 'but still near the peak.'),
  en='Rents are easing a little, but still high.')
S('local canadians lo kuda 30', ['grocery shopping prices', 'supermarket shopping', 'shopping cart grocery'],
  ov=stat('30%', 'of Canadians struggle with basic expenses', 'As stated in narration'),
  en='Even 30% of local Canadians struggle with basics.')
S('third mana telugu katha', ['community meeting hall', 'group meeting discussion', 'meeting people table'],
  en='Third: our Telugu story — a community leaders\' meeting in Toronto.')
G('lo vaallu cheppina maata', 'CommunityEstimate', tail=(5.5, ['indian students group campus', 'graduation indian students', 'young graduates'], dict(t='estimate', text='Community estimate — not official data', sub='Telugu community leaders, Toronto')), en='80% of Telugu graduates once got permits and jobs; now 20% — a community estimate.')
S('unna degree kosam polam', ['indian village farmer', 'indian farmland village', 'rural india family'],
  ov=loc('WARANGAL · NELLORE', 'FAMILIES WHO SOLD LAND FOR A DEGREE'), en='Think of a Warangal or Nellore family that sold land for this degree.')
G('alochinchandi degree ayipoyindhi', 'LifeChecklist', en='Degree done. Loan still running. No job. Permit expiring.')
S('ayipothondhi ayina intiki', ['video call family phone', 'video call laptop parents', 'woman video call smiling'],
  en='Yet the photo sent home shows snow, a coffee cup, a smile.')
S('navvu intha kashtam lo', ['lonely person snow night', 'man walking alone snow', 'snowy street night alone'],
  en='In all this hardship, is society supportive — or is something else happening?')

# ───────────────────────────── 7. FROM WELCOME TO BLAME ─────────────────────────────
S('7 from welcome to blame', ['protest signs', 'crowd protest city', 'protest march'], ov=dict(t='chapter', num='07', title='From Welcome to Blame', sub='Anger is not hatred'))
S('economy kashtamga unnappudu', ['protest crowd street', 'demonstration crowd', 'street protest'],
  en='When the economy is hard, people look for someone to blame.')
S('vethukutharu canada lo aa blame', ['man reading phone street', 'indian man phone city', 'man looking phone night'],
  en='In Canada that blame fell on Indians.', off=0.8)
G('oka analysis prakaram 2023', 'ISDStat', kind='doc', tail=(6.5, ['phone social media scrolling', 'social media phone', 'typing phone dark'], None), en='One analysis: posts with anti-South Asian slurs on X rose 1,350%+ from 2023 to 2024.')
P('2024 december lo wasaga beach', 'wasaga_beach_2024', ov=loc('WASAGA BEACH', 'ONTARIO'),
  en='A false viral video claimed Indians were misusing Wasaga Beach.')
G('misuse chesthunnaru ani fake', 'ViralClaim', en='Fake video, gone viral.')
G('anonymous accounts canada cities', 'AIImageCard', tail=(4.5, ['city skyline dusk', 'skyline evening canada', 'city dusk aerial'], None), en='Anonymous accounts posted AI images of Indian flags over Canadian cities: "Canada in 2050".')
S('cheyyadam modalupettaayi indians', ['scrolling phone night', 'hands phone scrolling', 'phone screen scrolling dark'],
  en='Newcomers say they brace themselves before opening the comments.')
P('idhi canada history lo kotha', 'komagata_vpl130', ov=dict(t='archive', text='KOMAGATA MARU · VANCOUVER, 1914',
  sub='376 passengers from British India; most were refused entry'), en='Not new: in 1914 the Komagata Maru was turned back under racial laws.', mode='archive')
P('komagata maru ship ni racial', 'komagata_vpl13158', ov=dict(t='archive', text='PASSENGERS ON DECK, JULY 1914', sub='Library and Archives / Vancouver Public Library'),
  mode='archive', en='Turned back under racially exclusionary laws.')
S('samvathsaraalu daatina bhaasha maarindhi', ['old film city street', 'black and white street', 'vintage city street'],
  ov=question('A century later, the language changed.', '"Outsiders are taking our jobs and homes" — the fear did not.'),
  en='A century on, the words changed but the fear stayed.')
S('normal canadians lo chala mandhiki', ['tired commuters subway', 'commuters train', 'people commuting'],
  en='Most ordinary Canadians have no hatred — they are exhausted.')
S('kattalekapothunnaru pillalaki jobs', ['bills paperwork worried', 'paying bills worried', 'man worried bills'],
  en='Can\'t pay rent, kids can\'t find jobs, hours waiting in hospitals.')
S('cheyyalsi vasthondhi veganga', ['hospital waiting area', 'clinic waiting room', 'emergency waiting'],
  ov=kicker('Anger at a system that grew too fast.', 'Anger is one thing. Hatred is another.'),
  en='Anger at a system that grew too fast. Anger is different from hatred.')
S('kaani aa kopam system lo', ['south asian man crowd', 'indian man city crowd', 'man in crowd street'],
  en='But that anger lands on the most visible Indian face.')
S('inko irony entante ennello', ['older indian man', 'indian businessman', 'older couple walking'], ov=dict(t='kicker', text='Some long-settled Indians now say: "cut immigration."', sub='Closing the door that was opened for them.'), en='Irony: some Indians settled years ago now say "cut immigration" — closing the door opened for them.')
G('intha kopam cuts madhyalo', 'Door3D', three=True, state='ajar', en='Amid all this anger and cuts, why open a back door?')

# ───────────────────────────── 8. THE BACK DOOR ─────────────────────────────
S('8 the back door', ['open door light', 'door opening light', 'back door'], ov=dict(t='chapter', num='08', title='The Back Door', sub='The 5 November 2026 measure'))
G('intro lo cheppukunna 2026 november', 'OfficialDoc', kind='doc', en='Back to the 5 November 2026 announcement.')
G('2026 lo canada regular limits', 'LevelsTable', en='Budget 2026 holds regular limits to 2029: 380,000 PR, 370,000 temporary arrivals.')
G('arrivals dhaggare unchindhi vaatiki', 'Cohorts3D', three=True, tail=(9.5, ['workers factory canada', 'family airport reunion', 'family reunion airport'], None), en='On top: a one-time measure for 200,000 already in Canada by end-2027 — 100,000 workers, 100,000 humanitarian/family.')
S('deeniki mundhe rural areas', ['farm workers', 'rural farm canada', 'greenhouse workers'], ov=dict(t='kicker', text='Earlier: a separate one-time initiative', sub='For up to 33,000 workers already in Canada'), en='Before this, another one-time program for 33,000 workers.')
S('rendu samvathsaraaluga cut chesthu', ['toronto aerial day', 'city aerial drone canada', 'downtown aerial'],
  en='Why would a government that cut for two years suddenly open this door? A problem of its own making.')
S('already desam lopale pani', ['construction workers site', 'warehouse workers', 'workers commuting morning'],
  en='Lakhs already work inside the country, paying taxes and rent.')
S('vaallani deport cheyyadam kharchu', ['airplane takeoff', 'plane taking off runway', 'airport plane departure'],
  en='Deporting them is expensive and a political headache.')
S('vadhilesthe underground economy', ['dark alley night', 'back alley night city', 'cash under table'],
  en='Left without status, an underground economy forms.')
G('vaallani pr ki marchadame', 'SelectionSieve', tail=(5.5, ['workers walking city', 'people walking office', 'commuters morning'], None), en='Converting the ones it needs to PR is the cheapest way. Canada isn\'t inviting newcomers — it\'s choosing whom to keep.')
G('kaani idhi automatic pr kaadhu', 'NotAutomatic', tail=(6.0, ['documents signing desk', 'application form', 'paperwork signing'], None), en='Not automatic PR. Not everyone qualifies. Full rules not yet published.')
S('mundhu 33,000 program kuda', ['worried worker', 'man worried thinking', 'worker tired'],
  en='An expert said even the earlier 33,000 program raised false hopes.')
G('politically pm carney dheenini', 'FaceOff', kind='photo', en='PM Carney defends it; opposition leader Pierre Poilievre calls it a "disaster".')
S('mana pillalaki asalu question', ['young man thinking city', 'student thinking window', 'young woman thinking'],
  ov=question('"Am I in the group', 'Canada wants to keep?"'),
  en='The only question for our kids: "Am I in the group Canada wants to keep?"')

# ───────────────────────────── 9. YOUR VERDICT ─────────────────────────────
S('9 your verdict', ['judge gavel', 'scales justice', 'decision crossroads'], ov=dict(t='chapter', num='09', title='Your Verdict', sub='Five ground realities'))
G('malli aa whatsapp group', 'PostcardReturn', tail=(6.5, ['group chat phone', 'phone messages scrolling', 'smartphone chat'], None), en='Back to that WhatsApp group: the "Settled bro" photo, 40 replies. Has your angle changed?')
S('evaraina gaani canada plan', ['education consultant meeting', 'counselor student meeting', 'office consultation'], ov=dict(t='list', title='FIVE GROUND REALITIES', items=['Course', 'College', 'Province', 'Budget', 'Alternatives']), en='Five realities no consultancy will tell you.')
S('first course e course ayina', ['student library', 'students studying library', 'college lecture'], ov=dict(t='reality', n='01', title='COURSE', line='"Any course, any job, then PR" is dead.'))
S('healthcare trades french in-demand', ['electrician working', 'welder working', 'nurse hospital ward'],
  ov=kicker('PR chances now track healthcare, trades, French', 'and in-demand Canadian experience.'),
  en='Only healthcare, trades, French, in-demand Canadian experience give PR chances.')
S('second college admission letters', ['college campus building', 'campus walkway', 'university hallway'], ov=dict(t='reality', n='02', title='COLLEGE', line='Avoid colleges that sell admission letters.'))
S('part-time tho fees kattesochu', ['job application rejected', 'man looking job board', 'job search phone'],
  ov=kicker('"You can pay fees with part-time work"?', 'Walk out. Part-time jobs are now hard to find.'),
  en='If an agent says part-time work will pay the fees — walk out.')
G('third province provincial nominations', 'ProvinceMap', variant='reality')
S('vancouver kanna chinna provinces', ['canada rural town aerial', 'prairie town aerial', 'small town canada winter'],
  en='Smaller provinces and rural areas have clearer paths than Toronto or Vancouver.')
G('fourth budget tuition kaakunda', 'BudgetCard', tail=(4.5, ['grocery shopping', 'counting money wallet', 'shopping receipt'], None), en='Budget: show at least ~C$20,600 for living costs besides tuition; rent eats most income in big cities.')
G('fifth alternatives chala mandhi', 'AlternativesMap', tail=(5.0, ['berlin city', 'germany city aerial', 'new zealand landscape'], None), en='Alternatives: many Telugu students now look at Germany and New Zealand.')
G('intro lo adigina question canada', 'Door3D', three=True, state='selective', tail=(6.5, ['canada flag city', 'toronto skyline day', 'canada flag building'], None), en='Opening or closing? Neither — Canada opens its door for itself, for those it needs.')
S('ni chuskuntunna oka country', ['canada landscape lake', 'canadian mountains lake', 'canada nature aerial'],
  ov=kicker('Not a villain. Not a paradise.', 'A country handling its own problems.'),
  en='Not a villain, not a paradise — a country dealing with its own problems.', off=-1.0)
S('aa khammam kurraadu vinthaina', ['young man alone shop night', 'young man sitting alone', 'lonely young man'],
  en='That Khammam boy did nothing unusual — he followed the formula everyone followed.')
G('cheyyaledhu andharu follow ayina', 'FormulaReturn', tail=(3.8, ['indian family home evening', 'indian parents talking', 'family home india'], None), en='Consultancies sold it, relatives believed it; Canada rewarded it for a few years, then changed its mind.')
S('abroad vellalani kala kanadam', ['airplane window clouds', 'plane window view', 'airplane flying sky'],
  en='Dreaming of going abroad isn\'t wrong...')
G('kaadhu kaani okka budget', 'LandOnScale', tail=(3.8, ['farmland sunset india', 'rice field aerial', 'green farmland aerial'], None), en='...betting the family\'s land on a policy that changes with one budget is.')
S('anduke moodu questions vadilesthunnanu', ['indian family dinner table', 'indian family talking', 'family discussion home'],
  ov=question('Three questions.'), en='So I leave you three questions.')
S('1 mee intlo pillodu repu', ['indian father son talking', 'father son conversation', 'parents child talking'], ov=dict(t='qcard', n='1', text='If your child says "I\'m going to Canada" tomorrow — do you sign a ₹40 lakh loan now, or wait for the new PR rules?'))
S('2 canada thana housing jobs', ['toronto houses street', 'housing neighborhood canada', 'residential street winter'], ov=dict(t='qcard', n='2', text='Is it fair for Canada to blame immigrants for its housing and jobs problems — or is it correcting its own policy mistakes?'))
S('3 mana telugu families lo', ['indian family together', 'indian grandparents', 'family photo indian'], ov=dict(t='qcard', n='3', text='Is it time Telugu families changed the "abroad means settled" mindset?'))
S('mee answers ni opinions', ['sharing phone message', 'phone message typing', 'hands phone typing'],
  ov=kicker('Your answers — in the comments.', 'Share this with anyone planning to go abroad.'),
  en='Comment your answers; share this video with friends or family planning to go abroad.')
G('mee friends lo gaani', 'FinalMap', en='Until Canada publishes the rules for the 200,000 PR plan — thanks for watching.')
