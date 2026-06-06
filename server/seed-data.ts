import { Pool, PoolClient } from "pg";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt.toString("hex")}.${hash.toString("hex")}`;
}

interface SingerDef {
  first: string;
  last: string;
  voiceType: string;
  fach: string;
  email: string;
  headshotIdx: number;
}

const SOPRANOS: SingerDef[] = [
  { first: "Anna", last: "Petrova", voiceType: "Soprano", fach: "Dramatic Soprano", email: "anna.petrova@example.com", headshotIdx: 0 },
  { first: "Maria", last: "Castellano", voiceType: "Soprano", fach: "Lyric Soprano", email: "maria.castellano@example.com", headshotIdx: 1 },
  { first: "Elena", last: "Volkov", voiceType: "Soprano", fach: "Coloratura Soprano", email: "elena.volkov@example.com", headshotIdx: 2 },
  { first: "Sarah", last: "Chen", voiceType: "Soprano", fach: "Lyric Soprano", email: "sarah.chen@example.com", headshotIdx: 3 },
  { first: "Lucia", last: "Fernandez", voiceType: "Soprano", fach: "Spinto Soprano", email: "lucia.fernandez@example.com", headshotIdx: 4 },
  { first: "Katherine", last: "Wells", voiceType: "Soprano", fach: "Soubrette", email: "katherine.wells@example.com", headshotIdx: 5 },
  { first: "Yuki", last: "Tanaka", voiceType: "Soprano", fach: "Lyric Soprano", email: "yuki.tanaka@example.com", headshotIdx: 6 },
  { first: "Nadia", last: "Horvat", voiceType: "Soprano", fach: "Dramatic Soprano", email: "nadia.horvat@example.com", headshotIdx: 7 },
  { first: "Isabella", last: "Moretti", voiceType: "Soprano", fach: "Coloratura Soprano", email: "isabella.moretti@example.com", headshotIdx: 8 },
  { first: "Johanna", last: "Braun", voiceType: "Soprano", fach: "Lyric Soprano", email: "johanna.braun@example.com", headshotIdx: 9 },
  { first: "Camille", last: "Dupont", voiceType: "Soprano", fach: "Spinto Soprano", email: "camille.dupont@example.com", headshotIdx: 10 },
  { first: "Aisha", last: "Williams", voiceType: "Soprano", fach: "Lyric Soprano", email: "aisha.williams@example.com", headshotIdx: 11 },
  { first: "Fiona", last: "O'Brien", voiceType: "Soprano", fach: "Dramatic Soprano", email: "fiona.obrien@example.com", headshotIdx: 12 },
  { first: "Svetlana", last: "Kuznetsova", voiceType: "Soprano", fach: "Lyric Soprano", email: "svetlana.kuznetsova@example.com", headshotIdx: 13 },
  { first: "Diana", last: "Reyes", voiceType: "Soprano", fach: "Coloratura Soprano", email: "diana.reyes@example.com", headshotIdx: 14 },
  { first: "Margaret", last: "Liu", voiceType: "Soprano", fach: "Soubrette", email: "margaret.liu@example.com", headshotIdx: 15 },
  { first: "Tatiana", last: "Sorokin", voiceType: "Soprano", fach: "Dramatic Soprano", email: "tatiana.sorokin@example.com", headshotIdx: 16 },
  { first: "Christina", last: "Park", voiceType: "Soprano", fach: "Lyric Soprano", email: "christina.park@example.com", headshotIdx: 17 },
  { first: "Victoria", last: "Alonso", voiceType: "Soprano", fach: "Spinto Soprano", email: "victoria.alonso@example.com", headshotIdx: 18 },
  { first: "Hannah", last: "Morrison", voiceType: "Soprano", fach: "Lyric Soprano, contralto capable", email: "hannah.morrison@example.com", headshotIdx: 19 },
];

const MEZZOS: SingerDef[] = [
  { first: "Alexandra", last: "Rossi", voiceType: "Mezzo-Soprano", fach: "Lyric Mezzo", email: "alexandra.rossi@example.com", headshotIdx: 20 },
  { first: "Carmen", last: "Delgado", voiceType: "Mezzo-Soprano", fach: "Dramatic Mezzo", email: "carmen.delgado@example.com", headshotIdx: 21 },
  { first: "Rachel", last: "Kim", voiceType: "Mezzo-Soprano", fach: "Lyric Mezzo", email: "rachel.kim@example.com", headshotIdx: 22 },
  { first: "Olga", last: "Federova", voiceType: "Mezzo-Soprano", fach: "Dramatic Mezzo", email: "olga.federova@example.com", headshotIdx: 23 },
  { first: "Michelle", last: "Bernard", voiceType: "Mezzo-Soprano", fach: "Coloratura Mezzo", email: "michelle.bernard@example.com", headshotIdx: 24 },
  { first: "Patricia", last: "Santos", voiceType: "Mezzo-Soprano", fach: "Lyric Mezzo", email: "patricia.santos@example.com", headshotIdx: 25 },
  { first: "Deborah", last: "Washington", voiceType: "Mezzo-Soprano", fach: "Dramatic Mezzo", email: "deborah.washington@example.com", headshotIdx: 26 },
  { first: "Ingrid", last: "Larsen", voiceType: "Mezzo-Soprano", fach: "Lyric Mezzo, contralto capable", email: "ingrid.larsen@example.com", headshotIdx: 27 },
  { first: "Marguerite", last: "Fontaine", voiceType: "Mezzo-Soprano", fach: "Coloratura Mezzo", email: "marguerite.fontaine@example.com", headshotIdx: 28 },
  { first: "Teresa", last: "Lombardi", voiceType: "Mezzo-Soprano", fach: "Dramatic Mezzo", email: "teresa.lombardi@example.com", headshotIdx: 29 },
  { first: "Sandra", last: "Nilsson", voiceType: "Mezzo-Soprano", fach: "Lyric Mezzo, contralto capable", email: "sandra.nilsson@example.com", headshotIdx: 30 },
  { first: "Natasha", last: "Ivanova", voiceType: "Mezzo-Soprano", fach: "Dramatic Mezzo", email: "natasha.ivanova@example.com", headshotIdx: 31 },
  { first: "Keiko", last: "Yamamoto", voiceType: "Mezzo-Soprano", fach: "Lyric Mezzo", email: "keiko.yamamoto@example.com", headshotIdx: 32 },
  { first: "Barbara", last: "Klein", voiceType: "Mezzo-Soprano", fach: "Lyric Mezzo, contralto capable", email: "barbara.klein@example.com", headshotIdx: 33 },
  { first: "Valentina", last: "Cruz", voiceType: "Mezzo-Soprano", fach: "Dramatic Mezzo", email: "valentina.cruz@example.com", headshotIdx: 34 },
  { first: "Josephine", last: "Taylor", voiceType: "Mezzo-Soprano", fach: "Coloratura Mezzo", email: "josephine.taylor@example.com", headshotIdx: 35 },
  { first: "Andrea", last: "Fischer", voiceType: "Mezzo-Soprano", fach: "Lyric Mezzo", email: "andrea.fischer@example.com", headshotIdx: 36 },
  { first: "Rita", last: "Cardoso", voiceType: "Mezzo-Soprano", fach: "Dramatic Mezzo, contralto capable", email: "rita.cardoso@example.com", headshotIdx: 37 },
];

const TENORS: SingerDef[] = [
  { first: "Michael", last: "Torres", voiceType: "Tenor", fach: "Lyric Tenor", email: "michael.torres@example.com", headshotIdx: 38 },
  { first: "Giovanni", last: "Benedetti", voiceType: "Tenor", fach: "Spinto Tenor", email: "giovanni.benedetti@example.com", headshotIdx: 39 },
  { first: "James", last: "Park", voiceType: "Tenor", fach: "Lyric Tenor", email: "james.park@example.com", headshotIdx: 40 },
  { first: "David", last: "Koenig", voiceType: "Tenor", fach: "Heldentenor", email: "david.koenig@example.com", headshotIdx: 41 },
  { first: "Carlos", last: "Mendoza", voiceType: "Tenor", fach: "Lyric Tenor", email: "carlos.mendoza@example.com", headshotIdx: 42 },
  { first: "Alexei", last: "Volkov", voiceType: "Tenor", fach: "Spinto Tenor", email: "alexei.volkov@example.com", headshotIdx: 43 },
  { first: "Benjamin", last: "Shaw", voiceType: "Tenor", fach: "Leggiero Tenor", email: "benjamin.shaw@example.com", headshotIdx: 44 },
  { first: "Philippe", last: "Laurent", voiceType: "Tenor", fach: "Lyric Tenor", email: "philippe.laurent@example.com", headshotIdx: 45 },
  { first: "Robert", last: "Chen", voiceType: "Tenor", fach: "Lyric Tenor", email: "robert.chen@example.com", headshotIdx: 46 },
  { first: "Antonio", last: "Ferrara", voiceType: "Tenor", fach: "Spinto Tenor", email: "antonio.ferrara@example.com", headshotIdx: 47 },
  { first: "William", last: "Hayes", voiceType: "Tenor", fach: "Heldentenor", email: "william.hayes@example.com", headshotIdx: 48 },
  { first: "Hans", last: "Mueller", voiceType: "Tenor", fach: "Lyric Tenor", email: "hans.mueller@example.com", headshotIdx: 49 },
  { first: "Eduardo", last: "Ortiz", voiceType: "Tenor", fach: "Leggiero Tenor", email: "eduardo.ortiz@example.com", headshotIdx: 50 },
  { first: "Christopher", last: "Evans", voiceType: "Tenor", fach: "Lyric Tenor", email: "christopher.evans@example.com", headshotIdx: 51 },
  { first: "Sergei", last: "Popov", voiceType: "Tenor", fach: "Spinto Tenor", email: "sergei.popov@example.com", headshotIdx: 52 },
  { first: "Thomas", last: "Andersen", voiceType: "Tenor", fach: "Lyric Tenor", email: "thomas.andersen@example.com", headshotIdx: 53 },
  { first: "Kenneth", last: "Yamada", voiceType: "Tenor", fach: "Leggiero Tenor", email: "kenneth.yamada@example.com", headshotIdx: 54 },
  { first: "Patrick", last: "Sullivan", voiceType: "Tenor", fach: "Lyric Tenor", email: "patrick.sullivan@example.com", headshotIdx: 55 },
];

const BARITONES: SingerDef[] = [
  { first: "Marco", last: "Rinaldi", voiceType: "Baritone", fach: "Lyric Baritone", email: "marco.rinaldi@example.com", headshotIdx: 56 },
  { first: "Jonathan", last: "Blake", voiceType: "Baritone", fach: "Verdi Baritone", email: "jonathan.blake@example.com", headshotIdx: 57 },
  { first: "Andre", last: "Williams", voiceType: "Baritone", fach: "Dramatic Baritone", email: "andre.williams@example.com", headshotIdx: 58 },
  { first: "Stefan", last: "Horvat", voiceType: "Baritone", fach: "Bass-Baritone", email: "stefan.horvat@example.com", headshotIdx: 59 },
  { first: "Richard", last: "Hoffman", voiceType: "Baritone", fach: "Lyric Baritone", email: "richard.hoffman@example.com", headshotIdx: 60 },
  { first: "Luis", last: "Herrera", voiceType: "Baritone", fach: "Verdi Baritone", email: "luis.herrera@example.com", headshotIdx: 61 },
  { first: "Peter", last: "Johansson", voiceType: "Baritone", fach: "Dramatic Baritone", email: "peter.johansson@example.com", headshotIdx: 62 },
  { first: "Frank", last: "Dubois", voiceType: "Baritone", fach: "Lyric Baritone", email: "frank.dubois@example.com", headshotIdx: 63 },
  { first: "George", last: "Patterson", voiceType: "Baritone", fach: "Bass-Baritone", email: "george.patterson@example.com", headshotIdx: 64 },
  { first: "Dmitri", last: "Kozlov", voiceType: "Baritone", fach: "Verdi Baritone", email: "dmitri.kozlov@example.com", headshotIdx: 65 },
  { first: "Kevin", last: "O'Malley", voiceType: "Baritone", fach: "Lyric Baritone", email: "kevin.omalley@example.com", headshotIdx: 66 },
  { first: "Tomas", last: "Guerrero", voiceType: "Baritone", fach: "Dramatic Baritone", email: "tomas.guerrero@example.com", headshotIdx: 67 },
  { first: "Nicholas", last: "Grant", voiceType: "Baritone", fach: "Lyric Baritone", email: "nicholas.grant@example.com", headshotIdx: 68 },
  { first: "Charles", last: "Wright", voiceType: "Baritone", fach: "Bass-Baritone", email: "charles.wright@example.com", headshotIdx: 69 },
  { first: "Raymond", last: "Lee", voiceType: "Baritone", fach: "Verdi Baritone", email: "raymond.lee@example.com", headshotIdx: 70 },
  { first: "Albert", last: "Fischer", voiceType: "Baritone", fach: "Dramatic Baritone", email: "albert.fischer@example.com", headshotIdx: 71 },
  { first: "Simon", last: "Campbell", voiceType: "Baritone", fach: "Lyric Baritone", email: "simon.campbell@example.com", headshotIdx: 72 },
  { first: "Oscar", last: "Lindqvist", voiceType: "Baritone", fach: "Bass-Baritone", email: "oscar.lindqvist@example.com", headshotIdx: 73 },
];

const BASSES: SingerDef[] = [
  { first: "Vladimir", last: "Petrov", voiceType: "Bass", fach: "Basso Profondo", email: "vladimir.petrov@example.com", headshotIdx: 74 },
  { first: "James", last: "Henderson", voiceType: "Bass", fach: "Basso Cantante", email: "james.henderson@example.com", headshotIdx: 75 },
  { first: "Friedrich", last: "Bauer", voiceType: "Bass", fach: "Dramatic Bass", email: "friedrich.bauer@example.com", headshotIdx: 76 },
  { first: "Samuel", last: "Jackson", voiceType: "Bass", fach: "Bass-Baritone", email: "samuel.jackson@example.com", headshotIdx: 77 },
  { first: "Mikhail", last: "Sorokin", voiceType: "Bass", fach: "Basso Profondo", email: "mikhail.sorokin@example.com", headshotIdx: 78 },
  { first: "Lawrence", last: "Mitchell", voiceType: "Bass", fach: "Basso Cantante", email: "lawrence.mitchell@example.com", headshotIdx: 79 },
  { first: "Igor", last: "Zhukov", voiceType: "Bass", fach: "Dramatic Bass", email: "igor.zhukov@example.com", headshotIdx: 80 },
  { first: "Robert", last: "O'Connor", voiceType: "Bass", fach: "Bass-Baritone", email: "robert.oconnor@example.com", headshotIdx: 81 },
  { first: "Henrik", last: "Magnusson", voiceType: "Bass", fach: "Basso Profondo", email: "henrik.magnusson@example.com", headshotIdx: 82 },
  { first: "Arthur", last: "Kim", voiceType: "Bass", fach: "Basso Cantante", email: "arthur.kim@example.com", headshotIdx: 83 },
  { first: "Giuseppe", last: "Rizzo", voiceType: "Bass", fach: "Dramatic Bass", email: "giuseppe.rizzo@example.com", headshotIdx: 84 },
  { first: "Donald", last: "Pearson", voiceType: "Bass", fach: "Bass-Baritone", email: "donald.pearson@example.com", headshotIdx: 85 },
  { first: "Nikolai", last: "Dragunov", voiceType: "Bass", fach: "Basso Profondo", email: "nikolai.dragunov@example.com", headshotIdx: 86 },
  { first: "Timothy", last: "Walsh", voiceType: "Bass", fach: "Basso Cantante", email: "timothy.walsh@example.com", headshotIdx: 87 },
  { first: "Emilio", last: "Vargas", voiceType: "Bass", fach: "Dramatic Bass", email: "emilio.vargas@example.com", headshotIdx: 88 },
  { first: "Martin", last: "Lindberg", voiceType: "Bass", fach: "Bass-Baritone", email: "martin.lindberg@example.com", headshotIdx: 89 },
];

const COUNTERTENORS: SingerDef[] = [
  { first: "Daniel", last: "Rivera", voiceType: "Countertenor", fach: "Countertenor", email: "daniel.rivera@example.com", headshotIdx: 90 },
  { first: "Andrew", last: "Nakamura", voiceType: "Countertenor", fach: "Countertenor", email: "andrew.nakamura@example.com", headshotIdx: 91 },
  { first: "Marcus", last: "Thompson", voiceType: "Countertenor", fach: "Alto Countertenor", email: "marcus.thompson@example.com", headshotIdx: 92 },
  { first: "Julian", last: "De Vries", voiceType: "Countertenor", fach: "Countertenor", email: "julian.devries@example.com", headshotIdx: 93 },
  { first: "Ryan", last: "Mitchell", voiceType: "Countertenor", fach: "Alto Countertenor", email: "ryan.mitchell@example.com", headshotIdx: 94 },
  { first: "Alexander", last: "Popov", voiceType: "Countertenor", fach: "Countertenor", email: "alexander.popov@example.com", headshotIdx: 95 },
  { first: "Nathan", last: "Reeves", voiceType: "Countertenor", fach: "Countertenor", email: "nathan.reeves@example.com", headshotIdx: 96 },
  { first: "Christoph", last: "Braun", voiceType: "Countertenor", fach: "Alto Countertenor", email: "christoph.braun@example.com", headshotIdx: 97 },
  { first: "Isaiah", last: "Greene", voiceType: "Countertenor", fach: "Countertenor", email: "isaiah.greene@example.com", headshotIdx: 98 },
  { first: "Felix", last: "Kowalski", voiceType: "Countertenor", fach: "Alto Countertenor", email: "felix.kowalski@example.com", headshotIdx: 99 },
];

const ALL_SINGERS: SingerDef[] = [
  ...SOPRANOS, ...MEZZOS, ...TENORS, ...BARITONES, ...BASSES, ...COUNTERTENORS
];

const CITIES = [
  { city: "New York", state: "NY" },
  { city: "Los Angeles", state: "CA" },
  { city: "San Francisco", state: "CA" },
  { city: "Chicago", state: "IL" },
  { city: "Houston", state: "TX" },
  { city: "Dallas", state: "TX" },
  { city: "Atlanta", state: "GA" },
  { city: "Miami", state: "FL" },
  { city: "Boston", state: "MA" },
  { city: "Washington", state: "DC" },
  { city: "Philadelphia", state: "PA" },
  { city: "Seattle", state: "WA" },
  { city: "Minneapolis", state: "MN" },
  { city: "Denver", state: "CO" },
  { city: "Phoenix", state: "AZ" },
  { city: "Salt Lake City", state: "UT" },
  { city: "Cincinnati", state: "OH" },
  { city: "Kansas City", state: "MO" },
  { city: "Nashville", state: "TN" },
  { city: "New Orleans", state: "LA" },
];

const HEADSHOTS_FEMALE = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400",
  "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400",
  "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400",
  "https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=400",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400",
  "https://images.unsplash.com/photo-1464863979621-258859e62245?w=400",
  "https://images.unsplash.com/photo-1541101767792-f9b2b1c4f127?w=400",
  "https://images.unsplash.com/photo-1485875437071-bb711a2f0a0e?w=400",
  "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=400",
];

const HEADSHOTS_MALE = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400",
  "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400",
  "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400",
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400",
  "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400",
  "https://images.unsplash.com/photo-1528892952291-009c663ce843?w=400",
  "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400",
  "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400",
  "https://images.unsplash.com/photo-1504593811423-6dd665756598?w=400",
  "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=400",
  "https://images.unsplash.com/photo-1548449112-96a38a643324?w=400",
  "https://images.unsplash.com/photo-1504199367641-aba8151af406?w=400",
  "https://images.unsplash.com/photo-1530268729831-4b0b9e170218?w=400",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400",
  "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400",
];

const OPERA_COMPANIES = [
  "Opera Carolina", "Arizona Opera", "Opera Tampa", "Utah Opera",
  "Palm Beach Opera", "Opera San José", "Madison Opera", "Central City Opera",
  "Opera Omaha", "Opera Grand Rapids", "Cincinnati Opera",
  "Opera Theatre of Saint Louis", "Florida Grand Opera", "Atlanta Opera",
  "Washington National Opera",
];

const CONCERT_ORGS = [
  "Chicago Symphony", "LA Philharmonic", "Dallas Symphony",
  "Houston Symphony", "Boston Symphony", "Atlanta Symphony",
  "Minnesota Orchestra", "Seattle Symphony", "San Francisco Symphony",
  "Cincinnati Symphony",
];

const CONCERT_WORKS: { work: string; composer: string; languages: string[] }[] = [
  { work: "Beethoven Symphony No. 9", composer: "Beethoven", languages: ["German"] },
  { work: "Messiah", composer: "Handel", languages: ["English"] },
  { work: "Mozart Requiem", composer: "Mozart", languages: ["Latin"] },
  { work: "Verdi Requiem", composer: "Verdi", languages: ["Latin"] },
  { work: "Carmina Burana", composer: "Orff", languages: ["Latin", "German"] },
  { work: "Mahler Symphony No. 2", composer: "Mahler", languages: ["German"] },
  { work: "Mahler Symphony No. 4", composer: "Mahler", languages: ["German"] },
  { work: "Brahms Requiem", composer: "Brahms", languages: ["German"] },
  { work: "Rossini Stabat Mater", composer: "Rossini", languages: ["Latin"] },
  { work: "Elijah", composer: "Mendelssohn", languages: ["English"] },
  { work: "Bach Mass in B Minor", composer: "Bach", languages: ["Latin"] },
  { work: "St Matthew Passion", composer: "Bach", languages: ["German"] },
];

interface RoleDef {
  role: string;
  opera: string;
  composer: string;
  languages: string[];
}

const SOPRANO_ROLES: RoleDef[] = [
  { role: "Violetta", opera: "La Traviata", composer: "Verdi", languages: ["Italian"] },
  { role: "Mimì", opera: "La Bohème", composer: "Puccini", languages: ["Italian"] },
  { role: "Musetta", opera: "La Bohème", composer: "Puccini", languages: ["Italian"] },
  { role: "Pamina", opera: "Die Zauberflöte", composer: "Mozart", languages: ["German"] },
  { role: "Donna Anna", opera: "Don Giovanni", composer: "Mozart", languages: ["Italian"] },
  { role: "Countess", opera: "Le Nozze di Figaro", composer: "Mozart", languages: ["Italian"] },
  { role: "Susanna", opera: "Le Nozze di Figaro", composer: "Mozart", languages: ["Italian"] },
  { role: "Fiordiligi", opera: "Così fan tutte", composer: "Mozart", languages: ["Italian"] },
  { role: "Micaëla", opera: "Carmen", composer: "Bizet", languages: ["French"] },
  { role: "Tosca", opera: "Tosca", composer: "Puccini", languages: ["Italian"] },
  { role: "Cio-Cio-San", opera: "Madama Butterfly", composer: "Puccini", languages: ["Italian"] },
  { role: "Lucia", opera: "Lucia di Lammermoor", composer: "Donizetti", languages: ["Italian"] },
  { role: "Nedda", opera: "Pagliacci", composer: "Leoncavallo", languages: ["Italian"] },
  { role: "Adina", opera: "L'elisir d'amore", composer: "Donizetti", languages: ["Italian"] },
  { role: "Gilda", opera: "Rigoletto", composer: "Verdi", languages: ["Italian"] },
];

const MEZZO_ROLES: RoleDef[] = [
  { role: "Carmen", opera: "Carmen", composer: "Bizet", languages: ["French"] },
  { role: "Rosina", opera: "Il Barbiere di Siviglia", composer: "Rossini", languages: ["Italian"] },
  { role: "Cherubino", opera: "Le Nozze di Figaro", composer: "Mozart", languages: ["Italian"] },
  { role: "Dorabella", opera: "Così fan tutte", composer: "Mozart", languages: ["Italian"] },
  { role: "Amneris", opera: "Aida", composer: "Verdi", languages: ["Italian"] },
  { role: "Azucena", opera: "Il Trovatore", composer: "Verdi", languages: ["Italian"] },
  { role: "Eboli", opera: "Don Carlo", composer: "Verdi", languages: ["Italian"] },
  { role: "Dalila", opera: "Samson et Dalila", composer: "Saint-Saëns", languages: ["French"] },
  { role: "Octavian", opera: "Der Rosenkavalier", composer: "R. Strauss", languages: ["German"] },
  { role: "Hänsel", opera: "Hänsel und Gretel", composer: "Humperdinck", languages: ["German"] },
  { role: "Charlotte", opera: "Werther", composer: "Massenet", languages: ["French"] },
  { role: "Olga", opera: "Eugene Onegin", composer: "Tchaikovsky", languages: ["Russian"] },
];

const TENOR_ROLES: RoleDef[] = [
  { role: "Rodolfo", opera: "La Bohème", composer: "Puccini", languages: ["Italian"] },
  { role: "Tamino", opera: "Die Zauberflöte", composer: "Mozart", languages: ["German"] },
  { role: "Don Ottavio", opera: "Don Giovanni", composer: "Mozart", languages: ["Italian"] },
  { role: "Ferrando", opera: "Così fan tutte", composer: "Mozart", languages: ["Italian"] },
  { role: "Alfredo", opera: "La Traviata", composer: "Verdi", languages: ["Italian"] },
  { role: "Duke", opera: "Rigoletto", composer: "Verdi", languages: ["Italian"] },
  { role: "Pinkerton", opera: "Madama Butterfly", composer: "Puccini", languages: ["Italian"] },
  { role: "Cavaradossi", opera: "Tosca", composer: "Puccini", languages: ["Italian"] },
  { role: "Nemorino", opera: "L'elisir d'amore", composer: "Donizetti", languages: ["Italian"] },
  { role: "Count Almaviva", opera: "Il Barbiere di Siviglia", composer: "Rossini", languages: ["Italian"] },
  { role: "Lensky", opera: "Eugene Onegin", composer: "Tchaikovsky", languages: ["Russian"] },
  { role: "Belmonte", opera: "Die Entführung aus dem Serail", composer: "Mozart", languages: ["German"] },
];

const BARITONE_ROLES: RoleDef[] = [
  { role: "Figaro", opera: "Le Nozze di Figaro", composer: "Mozart", languages: ["Italian"] },
  { role: "Figaro", opera: "Il Barbiere di Siviglia", composer: "Rossini", languages: ["Italian"] },
  { role: "Don Giovanni", opera: "Don Giovanni", composer: "Mozart", languages: ["Italian"] },
  { role: "Escamillo", opera: "Carmen", composer: "Bizet", languages: ["French"] },
  { role: "Marcello", opera: "La Bohème", composer: "Puccini", languages: ["Italian"] },
  { role: "Guglielmo", opera: "Così fan tutte", composer: "Mozart", languages: ["Italian"] },
  { role: "Papageno", opera: "Die Zauberflöte", composer: "Mozart", languages: ["German"] },
  { role: "Count Almaviva", opera: "Le Nozze di Figaro", composer: "Mozart", languages: ["Italian"] },
  { role: "Germont", opera: "La Traviata", composer: "Verdi", languages: ["Italian"] },
  { role: "Rigoletto", opera: "Rigoletto", composer: "Verdi", languages: ["Italian"] },
  { role: "Scarpia", opera: "Tosca", composer: "Puccini", languages: ["Italian"] },
  { role: "Onegin", opera: "Eugene Onegin", composer: "Tchaikovsky", languages: ["Russian"] },
  { role: "Sharpless", opera: "Madama Butterfly", composer: "Puccini", languages: ["Italian"] },
  { role: "Zurga", opera: "Les pêcheurs de perles", composer: "Bizet", languages: ["French"] },
];

const BASS_ROLES: RoleDef[] = [
  { role: "Sarastro", opera: "Die Zauberflöte", composer: "Mozart", languages: ["German"] },
  { role: "Leporello", opera: "Don Giovanni", composer: "Mozart", languages: ["Italian"] },
  { role: "Commendatore", opera: "Don Giovanni", composer: "Mozart", languages: ["Italian"] },
  { role: "Sparafucile", opera: "Rigoletto", composer: "Verdi", languages: ["Italian"] },
  { role: "Colline", opera: "La Bohème", composer: "Puccini", languages: ["Italian"] },
  { role: "Basilio", opera: "Il Barbiere di Siviglia", composer: "Rossini", languages: ["Italian"] },
  { role: "King Philip", opera: "Don Carlo", composer: "Verdi", languages: ["Italian"] },
  { role: "Osmin", opera: "Die Entführung aus dem Serail", composer: "Mozart", languages: ["German"] },
  { role: "Gremin", opera: "Eugene Onegin", composer: "Tchaikovsky", languages: ["Russian"] },
  { role: "Ferrando", opera: "Il Trovatore", composer: "Verdi", languages: ["Italian"] },
  { role: "Raimondo", opera: "Lucia di Lammermoor", composer: "Donizetti", languages: ["Italian"] },
  { role: "Timur", opera: "Turandot", composer: "Puccini", languages: ["Italian"] },
];

const COUNTERTENOR_ROLES: RoleDef[] = [
  { role: "Oberon", opera: "A Midsummer Night's Dream", composer: "Britten", languages: ["English"] },
  { role: "Giulio Cesare", opera: "Giulio Cesare", composer: "Handel", languages: ["Italian"] },
  { role: "Rinaldo", opera: "Rinaldo", composer: "Handel", languages: ["Italian"] },
  { role: "Ottone", opera: "L'incoronazione di Poppea", composer: "Monteverdi", languages: ["Italian"] },
  { role: "Tolomeo", opera: "Giulio Cesare", composer: "Handel", languages: ["Italian"] },
  { role: "Arsace", opera: "Partenope", composer: "Handel", languages: ["Italian"] },
  { role: "Unulfo", opera: "Rodelinda", composer: "Handel", languages: ["Italian"] },
  { role: "Bertarido", opera: "Rodelinda", composer: "Handel", languages: ["Italian"] },
  { role: "Arsamenes", opera: "Xerxes", composer: "Handel", languages: ["Italian"] },
  { role: "Orfeo", opera: "Orfeo ed Euridice", composer: "Gluck", languages: ["Italian"] },
  { role: "Medoro", opera: "Orlando", composer: "Handel", languages: ["Italian"] },
  { role: "Ruggiero", opera: "Alcina", composer: "Handel", languages: ["Italian"] },
];

const PERFORMANCE_TYPE_COMBOS: string[][] = [
  ...Array(45).fill(["Opera", "Orchestra"]),
  ...Array(20).fill(["Opera", "Chorus"]),
  ...Array(15).fill(["Orchestra", "Chorus"]),
  ...Array(10).fill(["Opera", "Other"]),
  ...Array(10).fill(["Orchestra", "Other"]),
];

const TRAVEL_PREFS: { label: string; radius: number; modes: string[] }[] = [
  ...Array(40).fill({ label: "Local Drive Only", radius: 50, modes: ["car"] }),
  ...Array(35).fill({ label: "Regional Travel (Drive)", radius: 200, modes: ["car", "train"] }),
  ...Array(25).fill({ label: "National Travel (Flight)", radius: 500, modes: ["flight", "car"] }),
];

const AVAIL_STATUSES = [
  ...Array(13).fill("Available Immediately"),
  ...Array(13).fill("Available within 24 hours"),
  ...Array(13).fill("Available within 48 hours"),
  ...Array(13).fill("Available within 72 hours"),
  ...Array(12).fill("Booked through next month"),
  ...Array(12).fill("Booked through next season"),
  ...Array(12).fill("Summer Festival Only"),
  ...Array(12).fill("Limited Availability"),
];

const EMERGENCY_DIST: { hours: number | null; optIn: boolean }[] = [
  ...Array(30).fill({ hours: 24, optIn: true }),
  ...Array(25).fill({ hours: 48, optIn: true }),
  ...Array(20).fill({ hours: 72, optIn: true }),
  ...Array(25).fill({ hours: null, optIn: false }),
];

const LANGUAGE_POOL = ["Italian", "German", "French", "English", "Spanish", "Russian", "Czech"];

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function pickLanguages(idx: number): string[] {
  const langs: string[] = [];
  langs.push("English");
  if (idx < 70) langs.push("Italian");
  if (idx % 5 < 3) langs.push("German");
  if (idx % 2 === 0) langs.push("French");
  if (idx % 13 === 0) langs.push("Spanish");
  if (idx % 17 === 0 || idx % 33 === 0) langs.push("Russian");
  if (idx % 25 === 0 || idx === 50) langs.push("Czech");
  return [...new Set(langs)].slice(0, 5);
}

function pickYears(count: number, seed: number): number[] {
  const years: number[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    years.push(2017 + (s % 10));
  }
  return years;
}

function pickDepth(seed: number): string {
  const depths = ["1-2", "3-5", "6-10", "10+"];
  return depths[seed % depths.length];
}

function pickDate(seed: number): string {
  const year = 2020 + (seed % 6);
  const month = 1 + (seed % 12);
  return `${year}-${String(month).padStart(2, '0')}`;
}

function getRolePool(voiceType: string): RoleDef[] {
  switch (voiceType) {
    case "Soprano": return SOPRANO_ROLES;
    case "Mezzo-Soprano": return MEZZO_ROLES;
    case "Tenor": return TENOR_ROLES;
    case "Baritone": return BARITONE_ROLES;
    case "Bass": return BASS_ROLES;
    case "Countertenor": return COUNTERTENOR_ROLES;
    default: return SOPRANO_ROLES;
  }
}

function getPartName(voiceType: string): string {
  switch (voiceType) {
    case "Soprano": return "Soprano";
    case "Mezzo-Soprano": return "Mezzo-Soprano";
    case "Tenor": return "Tenor";
    case "Baritone": return "Baritone";
    case "Bass": return "Bass";
    case "Countertenor": return "Countertenor";
    default: return "Soprano";
  }
}

function isFemaleVoice(voiceType: string): boolean {
  return voiceType === "Soprano" || voiceType === "Mezzo-Soprano";
}

const UPCOMING_PRODUCTIONS = [
  { production: "La Bohème", city: "Omaha, NE" },
  { production: "Carmen", city: "Tampa, FL" },
  { production: "Le Nozze di Figaro", city: "San José, CA" },
  { production: "Die Zauberflöte", city: "Salt Lake City, UT" },
  { production: "La Traviata", city: "Charlotte, NC" },
  { production: "Don Giovanni", city: "Grand Rapids, MI" },
  { production: "Così fan tutte", city: "Tampa, FL" },
  { production: "Rigoletto", city: "Phoenix, AZ" },
  { production: "Tosca", city: "Palm Beach, FL" },
  { production: "Il Barbiere di Siviglia", city: "Madison, WI" },
  { production: "Lucia di Lammermoor", city: "Cincinnati, OH" },
  { production: "Madama Butterfly", city: "Atlanta, GA" },
  { production: "Messiah", city: "Dallas, TX" },
  { production: "Verdi Requiem", city: "Chicago, IL" },
  { production: "Mozart Requiem", city: "Boston, MA" },
  { production: "Carmina Burana", city: "Houston, TX" },
  { production: "Beethoven Symphony No. 9", city: "Minneapolis, MN" },
  { production: "Elijah", city: "Seattle, WA" },
];

const UPCOMING_DATES = [
  "2026-11-01", "2026-11-15", "2026-12-01", "2026-12-15",
  "2027-01-05", "2027-01-20", "2027-02-01", "2027-02-15",
  "2027-03-01", "2027-03-15", "2027-04-01", "2027-04-15",
  "2027-05-01", "2027-05-15", "2027-06-01", "2027-06-15",
];

const AGENT_NAMES = [
  "Columbia Artists", "IMG Artists", "Opus 3 Artists", "Barrett Vantage",
  "Hazard Chase", "Askonas Holt", "Tact Artists Management", null,
];

const UNION_STATUSES = ["AGMA", "AEA", "Non-Union"];

export async function seedDatabase(client: PoolClient | Pool) {
  const pw = await hashPassword("password123");
  const foundingExpires = new Date();
  foundingExpires.setFullYear(foundingExpires.getFullYear() + 1);

  const shuffledCities = seededShuffle(
    Array.from({ length: 100 }, (_, i) => CITIES[i % 20]),
    42
  );
  const shuffledPerfTypes = seededShuffle(PERFORMANCE_TYPE_COMBOS, 77);
  const shuffledTravel = seededShuffle(TRAVEL_PREFS, 99);
  const shuffledAvail = seededShuffle(AVAIL_STATUSES, 55);
  const shuffledEmergency = seededShuffle(EMERGENCY_DIST, 33);

  const tiers = [
    ...Array(34).fill("founding"),
    ...Array(40).fill("pro"),
    ...Array(26).fill("free"),
  ];
  const shuffledTiers = seededShuffle(tiers, 88);

  for (let i = 0; i < 100; i++) {
    const s = ALL_SINGERS[i];
    const loc = shuffledCities[i];
    const perfTypes = shuffledPerfTypes[i];
    const travel = shuffledTravel[i];
    const avail = shuffledAvail[i];
    const emergency = shuffledEmergency[i];
    const tier = shuffledTiers[i];
    const langs = pickLanguages(i);
    const female = isFemaleVoice(s.voiceType);
    const headshot = female
      ? HEADSHOTS_FEMALE[i % HEADSHOTS_FEMALE.length]
      : HEADSHOTS_MALE[(i - 38) % HEADSHOTS_MALE.length];

    const agentIdx = (i * 7 + 3) % AGENT_NAMES.length;
    const agent = AGENT_NAMES[agentIdx];
    const represented = agent !== null;
    const unionStatus = UNION_STATUSES[i % 3];
    const yearsActive = 3 + (i % 18);
    const viewedCount = 5 + ((i * 13) % 40);

    const shortBio = `${s.first} ${s.last} is a ${s.fach.toLowerCase()} based in ${loc.city}, ${loc.state} with ${yearsActive} years of professional experience in ${perfTypes.map(t => t.toLowerCase()).join(" and ")} performance.`;

    const isFounding = tier === "founding";

    const result = await client.query(
      `INSERT INTO singers (email, password, first_name, last_name, city, state, primary_voice_type, primary_fach, union_status, represented, agent_name, agent_email, website_url, short_bio, headshot_url, companies_worked_with, languages_sung, subscription_status, subscription_tier, admin_approved, emergency_opt_in, emergency_lead_time_hours, emergency_travel_radius_miles, emergency_travel_modes, languages_spoken, performance_types, viewed_count, founding_expires_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,'active',$18,true,$19,$20,$21,$22,$23,$24,$25,$26)
       RETURNING id`,
      [
        s.email, pw, s.first, s.last, loc.city, loc.state,
        s.voiceType, s.fach, unionStatus, represented,
        agent, agent ? `${agent.toLowerCase().replace(/\s+/g, '')}@agency.com` : null,
        null, shortBio, headshot,
        seededShuffle(OPERA_COMPANIES, i * 7).slice(0, 2 + (i % 3)),
        langs, tier, emergency.optIn,
        emergency.hours, travel.radius, travel.modes,
        langs, perfTypes, viewedCount,
        isFounding ? foundingExpires : null,
      ]
    );

    const singerId = result.rows[0].id;

    const rolePool = getRolePool(s.voiceType);
    const assignedRoles: RoleDef[] = [];

    for (let r = 0; r < 10; r++) {
      const role = rolePool[r % rolePool.length];
      if (assignedRoles.find(ar => ar.role === role.role && ar.opera === role.opera)) {
        const alt = rolePool[(r + 5) % rolePool.length];
        assignedRoles.push(alt);
      } else {
        assignedRoles.push(role);
      }
    }

    const uniqueRoles = assignedRoles.reduce((acc: RoleDef[], role) => {
      if (!acc.find(a => a.role === role.role && a.opera === role.opera)) {
        acc.push(role);
      }
      return acc;
    }, []);
    while (uniqueRoles.length < 10) {
      const extra = rolePool[uniqueRoles.length % rolePool.length];
      if (!uniqueRoles.find(a => a.role === extra.role && a.opera === extra.opera)) {
        uniqueRoles.push(extra);
      } else {
        uniqueRoles.push({
          ...extra,
          role: extra.role + " (cover)",
        });
      }
    }

    for (let r = 0; r < 10; r++) {
      const role = uniqueRoles[r];
      const company = OPERA_COMPANIES[(i * 3 + r * 7) % OPERA_COMPANIES.length];
      const year = 2017 + ((i + r * 3) % 10);
      const depth = pickDepth(i + r);
      const lastPerformed = `${year}-${String(1 + ((i + r) % 12)).padStart(2, '0')}`;

      await client.query(
        `INSERT INTO singer_roles (singer_id, role_name, work_title, composer, languages, performance_types, experience_depth, last_performed_date, notable_companies)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          singerId, role.role, role.opera, role.composer,
          role.languages, ["fully_staged"], depth, lastPerformed,
          [company],
        ]
      );
    }

    const partName = getPartName(s.voiceType);
    for (let w = 0; w < 6; w++) {
      const work = CONCERT_WORKS[(i + w * 3) % CONCERT_WORKS.length];
      const org = CONCERT_ORGS[(i * 2 + w) % CONCERT_ORGS.length];
      const year = 2020 + ((i + w) % 7);
      const depth = pickDepth(i + w + 5);
      const lastPerformed = `${year}-${String(1 + ((i + w * 2) % 12)).padStart(2, '0')}`;

      await client.query(
        `INSERT INTO singer_works (singer_id, work_title, composer, part_name, context, languages, experience_depth, last_performed_date)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          singerId, work.work, work.composer, partName,
          "Orchestra", work.languages, depth, lastPerformed,
        ]
      );
    }

    for (let a = 0; a < 3; a++) {
      const prod = UPCOMING_PRODUCTIONS[(i + a * 5) % UPCOMING_PRODUCTIONS.length];
      const dateIdx = (i * 3 + a * 4) % UPCOMING_DATES.length;
      const startDate = UPCOMING_DATES[dateIdx];
      const endDateObj = new Date(startDate);
      endDateObj.setDate(endDateObj.getDate() + 21 + (a * 7));
      const endDate = endDateObj.toISOString().split("T")[0];
      const expiresAt = new Date(endDateObj);
      expiresAt.setDate(expiresAt.getDate() + 30);

      const geoRadius = travel.radius <= 50 ? "50" : travel.radius <= 200 ? "200" : "national";

      await client.query(
        `INSERT INTO availabilities (singer_id, start_date, end_date, geographic_radius, status, expires_at)
         VALUES ($1,$2,$3,$4,'active',$5)`,
        [singerId, startDate, endDate, geoRadius, expiresAt]
      );
    }
  }

  await client.query(
    `INSERT INTO organizations (email, password, organization_name, organization_type, city, state, admin_approved, verified, subscription_tier, contact_reveal_limit, contact_reveals_used_this_month)
     VALUES ($1,$2,$3,$4,$5,$6,true,true,$7,$8,$9)`,
    ["sarah.mitchell@metopera.org", pw, "Metropolitan Opera", "Opera Company", "New York", "NY", "pro", 50, 3]
  );
  await client.query(
    `INSERT INTO organizations (email, password, organization_name, organization_type, city, state, admin_approved, verified, subscription_tier, contact_reveal_limit, contact_reveals_used_this_month)
     VALUES ($1,$2,$3,$4,$5,$6,true,true,$7,$8,$9)`,
    ["casting@lyricchicago.org", pw, "Lyric Opera of Chicago", "Opera Company", "Chicago", "IL", "pro", 50, 1]
  );
  await client.query(
    `INSERT INTO organizations (email, password, organization_name, organization_type, city, state, admin_approved, verified, subscription_tier, contact_reveal_limit, contact_reveals_used_this_month)
     VALUES ($1,$2,$3,$4,$5,$6,true,true,$7,$8,$9)`,
    ["casting@operasanjose.org", pw, "Opera San José", "Opera Company", "San José", "CA", "free", 3, 0]
  );
  await client.query(
    `INSERT INTO organizations (email, password, organization_name, organization_type, city, state, admin_approved, verified, subscription_tier, contact_reveal_limit, contact_reveals_used_this_month)
     VALUES ($1,$2,$3,$4,$5,$6,true,true,$7,$8,$9)`,
    ["casting@azopera.org", pw, "Arizona Opera", "Opera Company", "Phoenix", "AZ", "pro", 50, 2]
  );
  await client.query(
    `INSERT INTO organizations (email, password, organization_name, organization_type, city, state, admin_approved, verified, subscription_tier, contact_reveal_limit, contact_reveals_used_this_month)
     VALUES ($1,$2,$3,$4,$5,$6,true,true,$7,$8,$9)`,
    ["casting@operatampa.org", pw, "Opera Tampa", "Opera Company", "Tampa", "FL", "free", 3, 0]
  );
  await client.query(
    `INSERT INTO organizations (email, password, organization_name, organization_type, city, state, admin_approved, verified, subscription_tier, contact_reveal_limit, contact_reveals_used_this_month)
     VALUES ($1,$2,$3,$4,$5,$6,true,true,$7,$8,$9)`,
    ["casting@madisonopera.org", pw, "Madison Opera", "Opera Company", "Madison", "WI", "free", 3, 0]
  );
  await client.query(
    `INSERT INTO organizations (email, password, organization_name, organization_type, city, state, admin_approved, verified, subscription_tier, contact_reveal_limit, contact_reveals_used_this_month)
     VALUES ($1,$2,$3,$4,$5,$6,true,true,$7,$8,$9)`,
    ["casting@pbopera.org", pw, "Palm Beach Opera", "Opera Company", "Palm Beach", "FL", "pro", 50, 4]
  );

  console.log("Seeded 100 singers (20 soprano, 18 mezzo, 18 tenor, 18 baritone, 16 bass, 10 countertenor) + 7 organizations");
}
