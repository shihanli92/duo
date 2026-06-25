/**
 * Cross-language name variant mapping.
 * Keys are lowercase; values are alternate forms with language/culture tags.
 * Focus: genuine cross-cultural forms, not nicknames or diminutives.
 */
export interface NameVariant {
  name: string
  lang: string
}

const NAME_VARIANTS: Record<string, NameVariant[]> = {
  // ================================================================
  // GIRLS
  // ================================================================

  // -- Original seed names --
  amara: [
    { name: 'Amira', lang: 'Arabic' },
    { name: 'Amora', lang: 'Spanish' },
  ],
  freya: [
    { name: 'Freja', lang: 'Danish' },
    { name: 'Freyja', lang: 'Norse' },
  ],
  nadia: [
    { name: 'Nadya', lang: 'Russian' },
    { name: 'Nadiya', lang: 'Ukrainian' },
  ],
  zara: [
    { name: 'Zahra', lang: 'Arabic' },
    { name: 'Sara', lang: 'Italian' },
    { name: 'Sarah', lang: 'English' },
  ],
  cleo: [
    { name: 'Clio', lang: 'Italian' },
  ],
  thea: [
    { name: 'Theia', lang: 'Greek' },
    { name: 'Tia', lang: 'Spanish' },
  ],
  esme: [
    { name: 'Esmé', lang: 'French' },
    { name: 'Esmée', lang: 'French' },
    { name: 'Esma', lang: 'Turkish' },
  ],
  mila: [
    { name: 'Milla', lang: 'Finnish' },
  ],
  bianca: [
    { name: 'Blanca', lang: 'Spanish' },
    { name: 'Bianka', lang: 'Hungarian' },
  ],
  daphne: [
    { name: 'Dafne', lang: 'Italian' },
  ],
  hana: [
    { name: 'Hannah', lang: 'English' },
    { name: 'Hanna', lang: 'Scandinavian' },
  ],
  kaia: [
    { name: 'Kaya', lang: 'Turkish' },
    { name: 'Kaja', lang: 'Scandinavian' },
  ],
  livia: [
    { name: 'Olivia', lang: 'English' },
  ],
  maeve: [
    { name: 'Méabh', lang: 'Irish' },
  ],
  selene: [
    { name: 'Selena', lang: 'Spanish' },
    { name: 'Celina', lang: 'Polish' },
  ],
  talia: [
    { name: 'Thalia', lang: 'Greek' },
    { name: 'Tahlia', lang: 'Hebrew' },
    { name: 'Talya', lang: 'Hebrew' },
  ],
  anika: [
    { name: 'Annika', lang: 'Swedish' },
    { name: 'Annica', lang: 'Scandinavian' },
  ],

  // -- Expanded seed girls --
  aaliyah: [
    { name: 'Aliya', lang: 'Arabic' },
    { name: 'Aliyah', lang: 'Arabic' },
  ],
  alice: [
    { name: 'Alícia', lang: 'Portuguese' },
    { name: 'Alise', lang: 'Latvian' },
  ],
  anna: [
    { name: 'Ana', lang: 'Spanish' },
    { name: 'Anya', lang: 'Russian' },
    { name: 'Anne', lang: 'French' },
    { name: 'Hanna', lang: 'Finnish' },
  ],
  aria: [
    { name: 'Arya', lang: 'Sanskrit' },
    { name: 'Ariya', lang: 'Sanskrit' },
  ],
  audrey: [
    { name: 'Audra', lang: 'Lithuanian' },
  ],
  aurora: [
    { name: 'Aurore', lang: 'French' },
  ],
  beatrice: [
    { name: 'Béatrice', lang: 'French' },
    { name: 'Beatriz', lang: 'Spanish' },
    { name: 'Beatrix', lang: 'German' },
  ],
  caroline: [
    { name: 'Carolina', lang: 'Spanish' },
    { name: 'Karolina', lang: 'Polish' },
    { name: 'Carolyn', lang: 'English' },
  ],
  catherine: [
    { name: 'Katherine', lang: 'English' },
    { name: 'Kathryn', lang: 'English' },
    { name: 'Ekaterina', lang: 'Russian' },
    { name: 'Caterina', lang: 'Italian' },
    { name: 'Catalina', lang: 'Spanish' },
    { name: 'Katarina', lang: 'Swedish' },
  ],
  katherine: [
    { name: 'Catherine', lang: 'French' },
    { name: 'Kathryn', lang: 'English' },
    { name: 'Ekaterina', lang: 'Russian' },
    { name: 'Caterina', lang: 'Italian' },
    { name: 'Catalina', lang: 'Spanish' },
  ],
  charlotte: [
    { name: 'Charlotta', lang: 'Swedish' },
    { name: 'Carlotta', lang: 'Italian' },
  ],
  chloe: [
    { name: 'Chloé', lang: 'French' },
    { name: 'Khloe', lang: 'English' },
  ],
  chiara: [
    { name: 'Clara', lang: 'English' },
    { name: 'Claire', lang: 'French' },
  ],
  clara: [
    { name: 'Claire', lang: 'French' },
    { name: 'Clare', lang: 'English' },
    { name: 'Klara', lang: 'German' },
    { name: 'Chiara', lang: 'Italian' },
  ],
  diana: [
    { name: 'Dianna', lang: 'English' },
    { name: 'Diane', lang: 'French' },
  ],
  eleanor: [
    { name: 'Elinor', lang: 'English' },
    { name: 'Eleanore', lang: 'English' },
    { name: 'Eleonora', lang: 'Italian' },
    { name: 'Éléonore', lang: 'French' },
  ],
  elizabeth: [
    { name: 'Elisabeth', lang: 'French' },
    { name: 'Eliza', lang: 'English' },
    { name: 'Elisabetta', lang: 'Italian' },
    { name: 'Isabel', lang: 'Spanish' },
  ],
  eloise: [
    { name: 'Elouise', lang: 'English' },
    { name: 'Héloïse', lang: 'French' },
  ],
  emily: [
    { name: 'Emilie', lang: 'French' },
    { name: 'Emilia', lang: 'Italian' },
  ],
  emma: [
    { name: 'Ema', lang: 'Portuguese' },
  ],
  eva: [
    { name: 'Eve', lang: 'English' },
    { name: 'Ava', lang: 'English' },
    { name: 'Ewa', lang: 'Polish' },
  ],
  evelyn: [
    { name: 'Evelina', lang: 'Italian' },
    { name: 'Eveline', lang: 'French' },
  ],
  fatima: [
    { name: 'Fatimah', lang: 'Arabic' },
    { name: 'Fatma', lang: 'Turkish' },
  ],
  fern: [
    { name: 'Ferne', lang: 'English' },
  ],
  florence: [
    { name: 'Florencia', lang: 'Spanish' },
    { name: 'Fiorenza', lang: 'Italian' },
  ],
  frida: [
    { name: 'Frieda', lang: 'German' },
    { name: 'Frída', lang: 'Icelandic' },
  ],
  gemma: [
    { name: 'Jemma', lang: 'English' },
  ],
  genevieve: [
    { name: 'Geneviève', lang: 'French' },
    { name: 'Ginevra', lang: 'Italian' },
  ],
  grace: [
    { name: 'Gracia', lang: 'Spanish' },
    { name: 'Grazia', lang: 'Italian' },
  ],
  harriet: [
    { name: 'Harriett', lang: 'English' },
    { name: 'Henrietta', lang: 'English' },
  ],
  hazel: [
    { name: 'Hazle', lang: 'English' },
  ],
  helena: [
    { name: 'Helen', lang: 'English' },
    { name: 'Hélène', lang: 'French' },
    { name: 'Elena', lang: 'Italian' },
    { name: 'Jelena', lang: 'Serbian' },
  ],
  imogen: [
    { name: 'Imogene', lang: 'English' },
  ],
  jade: [
    { name: 'Jada', lang: 'English' },
    { name: 'Jayde', lang: 'English' },
  ],
  jane: [
    { name: 'Jayne', lang: 'English' },
    { name: 'Jeanne', lang: 'French' },
    { name: 'Giovanna', lang: 'Italian' },
    { name: 'Juana', lang: 'Spanish' },
  ],
  jasmine: [
    { name: 'Jasmin', lang: 'German' },
    { name: 'Yazmin', lang: 'Spanish' },
    { name: 'Yasmine', lang: 'Arabic' },
  ],
  julia: [
    { name: 'Julie', lang: 'French' },
    { name: 'Giulia', lang: 'Italian' },
    { name: 'Yulia', lang: 'Russian' },
  ],
  juliet: [
    { name: 'Juliette', lang: 'French' },
    { name: 'Giulietta', lang: 'Italian' },
  ],
  kira: [
    { name: 'Keira', lang: 'English' },
    { name: 'Kiara', lang: 'Italian' },
    { name: 'Kiera', lang: 'Irish' },
    { name: 'Kyra', lang: 'Greek' },
  ],
  layla: [
    { name: 'Leila', lang: 'Persian' },
    { name: 'Leyla', lang: 'Turkish' },
    { name: 'Laila', lang: 'Arabic' },
  ],
  leila: [
    { name: 'Layla', lang: 'Arabic' },
    { name: 'Leyla', lang: 'Turkish' },
  ],
  lila: [
    { name: 'Lilah', lang: 'English' },
    { name: 'Lyla', lang: 'English' },
  ],
  lily: [
    { name: 'Lillie', lang: 'English' },
    { name: 'Lilly', lang: 'English' },
    { name: 'Lili', lang: 'French' },
  ],
  linnea: [
    { name: 'Linnéa', lang: 'Swedish' },
  ],
  louisa: [
    { name: 'Louise', lang: 'French' },
    { name: 'Luisa', lang: 'Italian' },
    { name: 'Luise', lang: 'German' },
  ],
  lucia: [
    { name: 'Luzia', lang: 'Portuguese' },
    { name: 'Lucía', lang: 'Spanish' },
    { name: 'Lucie', lang: 'French' },
  ],
  lucy: [
    { name: 'Lucie', lang: 'French' },
    { name: 'Lucía', lang: 'Spanish' },
  ],
  lydia: [
    { name: 'Lidia', lang: 'Italian' },
    { name: 'Lyda', lang: 'English' },
  ],
  maia: [
    { name: 'Maya', lang: 'English' },
    { name: 'Maja', lang: 'Scandinavian' },
  ],
  maisie: [
    { name: 'Maisey', lang: 'English' },
    { name: 'Maisy', lang: 'English' },
  ],
  margaret: [
    { name: 'Marguerite', lang: 'French' },
    { name: 'Margherita', lang: 'Italian' },
    { name: 'Margarita', lang: 'Spanish' },
    { name: 'Greta', lang: 'German' },
  ],
  matilda: [
    { name: 'Mathilda', lang: 'Scandinavian' },
    { name: 'Matilde', lang: 'Italian' },
    { name: 'Tilda', lang: 'Scandinavian' },
  ],
  maya: [
    { name: 'Maia', lang: 'Greek' },
    { name: 'Maja', lang: 'Scandinavian' },
  ],
  miriam: [
    { name: 'Mirjam', lang: 'Dutch' },
    { name: 'Maryam', lang: 'Arabic' },
    { name: 'Mariam', lang: 'Arabic' },
  ],
  naomi: [
    { name: 'Naomie', lang: 'French' },
    { name: 'Nomi', lang: 'Italian' },
  ],
  niamh: [
    { name: 'Neve', lang: 'English' },
  ],
  nora: [
    { name: 'Norah', lang: 'English' },
    { name: 'Noora', lang: 'Finnish' },
    { name: 'Noura', lang: 'Arabic' },
  ],
  olivia: [
    { name: 'Livia', lang: 'Italian' },
    { name: 'Alivia', lang: 'English' },
  ],
  penelope: [
    { name: 'Penélope', lang: 'Spanish' },
    { name: 'Pénélope', lang: 'French' },
  ],
  rose: [
    { name: 'Rosa', lang: 'Italian' },
  ],
  rosalind: [
    { name: 'Rosaline', lang: 'English' },
    { name: 'Rosalinda', lang: 'Italian' },
    { name: 'Rosalyn', lang: 'English' },
  ],
  ruth: [
    { name: 'Rut', lang: 'Scandinavian' },
  ],
  sana: [
    { name: 'Sanaa', lang: 'Arabic' },
  ],
  sarah: [
    { name: 'Sara', lang: 'Italian' },
  ],
  sara: [
    { name: 'Sarah', lang: 'English' },
  ],
  scarlett: [
    { name: 'Scarlet', lang: 'English' },
  ],
  serena: [
    { name: 'Serina', lang: 'English' },
    { name: 'Séréna', lang: 'French' },
  ],
  sienna: [
    { name: 'Siena', lang: 'Italian' },
  ],
  sophia: [
    { name: 'Sofia', lang: 'Italian' },
    { name: 'Sofiya', lang: 'Russian' },
    { name: 'Zofia', lang: 'Polish' },
    { name: 'Sophie', lang: 'French' },
  ],
  sofia: [
    { name: 'Sophia', lang: 'English' },
    { name: 'Sofiya', lang: 'Russian' },
    { name: 'Zofia', lang: 'Polish' },
  ],
  soraya: [
    { name: 'Soraia', lang: 'Portuguese' },
  ],
  stella: [
    { name: 'Estella', lang: 'Spanish' },
    { name: 'Estrella', lang: 'Spanish' },
  ],
  valentina: [
    { name: 'Valentine', lang: 'French' },
  ],
  violet: [
    { name: 'Violette', lang: 'French' },
    { name: 'Violeta', lang: 'Spanish' },
    { name: 'Viola', lang: 'Italian' },
  ],
  virginia: [
    { name: 'Virginie', lang: 'French' },
  ],
  yara: [
    { name: 'Iara', lang: 'Portuguese' },
  ],
  zaina: [
    { name: 'Zayna', lang: 'Arabic' },
    { name: 'Zeina', lang: 'Arabic' },
  ],
  zoe: [
    { name: 'Zoey', lang: 'English' },
    { name: 'Zoé', lang: 'French' },
  ],
  aisling: [
    { name: 'Aislinn', lang: 'Irish' },
    { name: 'Ashling', lang: 'Irish' },
  ],
  amira: [
    { name: 'Ameera', lang: 'Arabic' },
    { name: 'Emira', lang: 'Arabic' },
  ],
  sky: [
    { name: 'Skye', lang: 'English' },
  ],
  rain: [
    { name: 'Rayne', lang: 'English' },
  ],
  hannah: [
    { name: 'Hana', lang: 'Japanese' },
    { name: 'Hanna', lang: 'Scandinavian' },
  ],
  isabelle: [
    { name: 'Isabel', lang: 'Spanish' },
    { name: 'Isobel', lang: 'Scottish' },
    { name: 'Isabella', lang: 'Italian' },
  ],
  emilia: [
    { name: 'Amelia', lang: 'English' },
    { name: 'Émilie', lang: 'French' },
  ],
  amelia: [
    { name: 'Emilia', lang: 'Italian' },
    { name: 'Amalia', lang: 'German' },
    { name: 'Amélie', lang: 'French' },
  ],
  madeline: [
    { name: 'Madeleine', lang: 'French' },
    { name: 'Madelyn', lang: 'English' },
  ],
  claire: [
    { name: 'Clare', lang: 'English' },
    { name: 'Chiara', lang: 'Italian' },
    { name: 'Clara', lang: 'Spanish' },
    { name: 'Klara', lang: 'German' },
  ],
  elena: [
    { name: 'Helena', lang: 'Greek' },
    { name: 'Hélène', lang: 'French' },
  ],
  vivian: [
    { name: 'Vivienne', lang: 'French' },
    { name: 'Vivien', lang: 'English' },
  ],
  natalie: [
    { name: 'Nathalie', lang: 'French' },
    { name: 'Natalia', lang: 'Spanish' },
  ],

  // ================================================================
  // BOYS
  // ================================================================

  // -- Original seed names --
  jasper: [
    { name: 'Kasper', lang: 'Scandinavian' },
    { name: 'Casper', lang: 'Dutch' },
    { name: 'Gaspard', lang: 'French' },
  ],
  mateo: [
    { name: 'Matteo', lang: 'Italian' },
    { name: 'Matthieu', lang: 'French' },
    { name: 'Matthew', lang: 'English' },
    { name: 'Mateus', lang: 'Portuguese' },
  ],
  finn: [
    { name: 'Fynn', lang: 'German' },
    { name: 'Fionn', lang: 'Irish' },
  ],
  kiran: [
    { name: 'Kieran', lang: 'Irish' },
    { name: 'Ciarán', lang: 'Irish' },
  ],
  luca: [
    { name: 'Luka', lang: 'Croatian' },
    { name: 'Lucas', lang: 'English' },
    { name: 'Luke', lang: 'English' },
  ],
  nico: [
    { name: 'Niko', lang: 'Finnish' },
    { name: 'Nicolas', lang: 'French' },
  ],
  oscar: [
    { name: 'Oskar', lang: 'German' },
    { name: 'Óscar', lang: 'Spanish' },
  ],
  rafael: [
    { name: 'Raphael', lang: 'French' },
    { name: 'Raffaele', lang: 'Italian' },
  ],
  silas: [
    { name: 'Sylas', lang: 'English' },
  ],
  bastian: [
    { name: 'Sebastian', lang: 'English' },
    { name: 'Sébastien', lang: 'French' },
    { name: 'Sebastiano', lang: 'Italian' },
  ],
  emeric: [
    { name: 'Emery', lang: 'English' },
    { name: 'Emmerich', lang: 'German' },
  ],
  lachlan: [
    { name: 'Lochlann', lang: 'Irish' },
  ],

  // -- Expanded seed boys --
  alexander: [
    { name: 'Alessandro', lang: 'Italian' },
    { name: 'Alexandre', lang: 'French' },
    { name: 'Alejandro', lang: 'Spanish' },
    { name: 'Aleksandr', lang: 'Russian' },
    { name: 'Alasdair', lang: 'Scottish' },
    { name: 'Iskander', lang: 'Arabic' },
  ],
  adam: [
    { name: 'Adamo', lang: 'Italian' },
    { name: 'Adám', lang: 'Hungarian' },
  ],
  adrian: [
    { name: 'Adriano', lang: 'Italian' },
    { name: 'Adrien', lang: 'French' },
    { name: 'Adrián', lang: 'Spanish' },
  ],
  arthur: [
    { name: 'Arturo', lang: 'Italian' },
    { name: 'Artur', lang: 'Portuguese' },
  ],
  axel: [
    { name: 'Aksel', lang: 'Scandinavian' },
    { name: 'Axl', lang: 'English' },
  ],
  benjamin: [
    { name: 'Benyamin', lang: 'Arabic' },
    { name: 'Benjamín', lang: 'Spanish' },
  ],
  caleb: [
    { name: 'Kaleb', lang: 'English' },
    { name: 'Calev', lang: 'Hebrew' },
  ],
  callum: [
    { name: 'Calum', lang: 'Scottish' },
  ],
  ciaran: [
    { name: 'Ciarán', lang: 'Irish' },
    { name: 'Kieran', lang: 'English' },
  ],
  cosimo: [
    { name: 'Cosmo', lang: 'English' },
    { name: 'Cosme', lang: 'French' },
  ],
  daniel: [
    { name: 'Daniele', lang: 'Italian' },
    { name: 'Danyal', lang: 'Arabic' },
    { name: 'Daniil', lang: 'Russian' },
  ],
  edward: [
    { name: 'Eduardo', lang: 'Spanish' },
    { name: 'Edoardo', lang: 'Italian' },
    { name: 'Édouard', lang: 'French' },
  ],
  elijah: [
    { name: 'Elias', lang: 'Greek' },
    { name: 'Élie', lang: 'French' },
    { name: 'Ilya', lang: 'Russian' },
  ],
  elias: [
    { name: 'Elijah', lang: 'English' },
    { name: 'Élie', lang: 'French' },
  ],
  forrest: [
    { name: 'Forest', lang: 'English' },
  ],
  gabriel: [
    { name: 'Gabriele', lang: 'Italian' },
    { name: 'Gavriil', lang: 'Russian' },
  ],
  george: [
    { name: 'Giorgio', lang: 'Italian' },
    { name: 'Georges', lang: 'French' },
    { name: 'Jorge', lang: 'Spanish' },
    { name: 'Georg', lang: 'German' },
  ],
  henry: [
    { name: 'Henri', lang: 'French' },
    { name: 'Henrik', lang: 'Scandinavian' },
    { name: 'Enrico', lang: 'Italian' },
    { name: 'Enrique', lang: 'Spanish' },
  ],
  ibrahim: [
    { name: 'Abraham', lang: 'English' },
    { name: 'Ibraheem', lang: 'Arabic' },
    { name: 'Avraham', lang: 'Hebrew' },
  ],
  isaac: [
    { name: 'Isaak', lang: 'German' },
    { name: 'Ishaq', lang: 'Arabic' },
    { name: 'Isacco', lang: 'Italian' },
  ],
  james: [
    { name: 'Jaime', lang: 'Spanish' },
    { name: 'Jacques', lang: 'French' },
    { name: 'Giacomo', lang: 'Italian' },
    { name: 'Séamus', lang: 'Irish' },
  ],
  jensen: [
    { name: 'Jenson', lang: 'English' },
  ],
  julian: [
    { name: 'Julien', lang: 'French' },
    { name: 'Giuliano', lang: 'Italian' },
    { name: 'Julián', lang: 'Spanish' },
  ],
  kieran: [
    { name: 'Ciarán', lang: 'Irish' },
    { name: 'Kieron', lang: 'English' },
  ],
  leo: [
    { name: 'Leon', lang: 'French' },
    { name: 'Leonardo', lang: 'Italian' },
    { name: 'Léo', lang: 'French' },
    { name: 'León', lang: 'Spanish' },
  ],
  liam: [
    { name: 'William', lang: 'English' },
    { name: 'Willem', lang: 'Dutch' },
    { name: 'Guillaume', lang: 'French' },
  ],
  lorenzo: [
    { name: 'Lawrence', lang: 'English' },
    { name: 'Laurent', lang: 'French' },
    { name: 'Lorenz', lang: 'German' },
  ],
  lucas: [
    { name: 'Lukas', lang: 'German' },
    { name: 'Luca', lang: 'Italian' },
    { name: 'Luc', lang: 'French' },
  ],
  miles: [
    { name: 'Myles', lang: 'English' },
    { name: 'Milo', lang: 'German' },
  ],
  milo: [
    { name: 'Miles', lang: 'English' },
    { name: 'Mylo', lang: 'English' },
  ],
  nikolai: [
    { name: 'Nicolas', lang: 'French' },
    { name: 'Niccolò', lang: 'Italian' },
    { name: 'Nicolás', lang: 'Spanish' },
    { name: 'Nikola', lang: 'Serbian' },
  ],
  noah: [
    { name: 'Noa', lang: 'Spanish' },
    { name: 'Noé', lang: 'French' },
  ],
  oliver: [
    { name: 'Olivier', lang: 'French' },
    { name: 'Oliviero', lang: 'Italian' },
  ],
  omar: [
    { name: 'Umar', lang: 'Arabic' },
    { name: 'Ömer', lang: 'Turkish' },
  ],
  owen: [
    { name: 'Ewen', lang: 'Scottish' },
    { name: 'Owyn', lang: 'English' },
  ],
  patrick: [
    { name: 'Pádraig', lang: 'Irish' },
    { name: 'Patrizio', lang: 'Italian' },
    { name: 'Patricio', lang: 'Spanish' },
  ],
  peter: [
    { name: 'Pierre', lang: 'French' },
    { name: 'Pietro', lang: 'Italian' },
    { name: 'Pedro', lang: 'Spanish' },
    { name: 'Piotr', lang: 'Polish' },
    { name: 'Petter', lang: 'Swedish' },
  ],
  philip: [
    { name: 'Philippe', lang: 'French' },
    { name: 'Filippo', lang: 'Italian' },
    { name: 'Felipe', lang: 'Spanish' },
    { name: 'Filip', lang: 'Scandinavian' },
  ],
  rhys: [
    { name: 'Reece', lang: 'English' },
    { name: 'Reese', lang: 'English' },
  ],
  samuel: [
    { name: 'Samuele', lang: 'Italian' },
    { name: 'Shmuel', lang: 'Hebrew' },
  ],
  santiago: [
    { name: 'Thiago', lang: 'Portuguese' },
    { name: 'Tiago', lang: 'Portuguese' },
    { name: 'Diego', lang: 'Spanish' },
  ],
  sebastian: [
    { name: 'Sébastien', lang: 'French' },
    { name: 'Sebastiano', lang: 'Italian' },
    { name: 'Bastian', lang: 'German' },
  ],
  simon: [
    { name: 'Simone', lang: 'Italian' },
    { name: 'Simón', lang: 'Spanish' },
  ],
  tariq: [
    { name: 'Tarek', lang: 'Arabic' },
    { name: 'Tarik', lang: 'Turkish' },
  ],
  theodore: [
    { name: 'Teodor', lang: 'Romanian' },
    { name: 'Théodore', lang: 'French' },
    { name: 'Teodoro', lang: 'Italian' },
  ],
  thomas: [
    { name: 'Tomás', lang: 'Spanish' },
    { name: 'Tommaso', lang: 'Italian' },
    { name: 'Tomas', lang: 'Scandinavian' },
  ],
  victor: [
    { name: 'Viktor', lang: 'German' },
    { name: 'Vittorio', lang: 'Italian' },
    { name: 'Víctor', lang: 'Spanish' },
  ],
  vincent: [
    { name: 'Vincenzo', lang: 'Italian' },
    { name: 'Vicente', lang: 'Spanish' },
  ],
  wilder: [
    { name: 'Wylder', lang: 'English' },
  ],
  william: [
    { name: 'Willem', lang: 'Dutch' },
    { name: 'Guillaume', lang: 'French' },
    { name: 'Guglielmo', lang: 'Italian' },
    { name: 'Guillermo', lang: 'Spanish' },
    { name: 'Liam', lang: 'Irish' },
  ],
  youssef: [
    { name: 'Yousef', lang: 'Arabic' },
    { name: 'Yusuf', lang: 'Turkish' },
    { name: 'Joseph', lang: 'English' },
    { name: 'Giuseppe', lang: 'Italian' },
  ],
  zayn: [
    { name: 'Zain', lang: 'Arabic' },
  ],
  dante: [
    { name: 'Durante', lang: 'Italian' },
  ],
  emil: [
    { name: 'Émile', lang: 'French' },
    { name: 'Emilio', lang: 'Italian' },
  ],
  enrique: [
    { name: 'Henry', lang: 'English' },
    { name: 'Henri', lang: 'French' },
    { name: 'Enrico', lang: 'Italian' },
  ],
  fabian: [
    { name: 'Fabien', lang: 'French' },
    { name: 'Fabiano', lang: 'Italian' },
  ],
  joaquin: [
    { name: 'Joaquím', lang: 'Portuguese' },
  ],
  marco: [
    { name: 'Marc', lang: 'French' },
    { name: 'Marcus', lang: 'English' },
    { name: 'Markus', lang: 'German' },
  ],

  // ================================================================
  // UNISEX
  // ================================================================

  rowan: [
    { name: 'Rowen', lang: 'English' },
  ],
  avery: [
    { name: 'Averie', lang: 'English' },
  ],
  quinn: [
    { name: 'Quin', lang: 'English' },
  ],
  marlowe: [
    { name: 'Marlo', lang: 'English' },
    { name: 'Marlow', lang: 'English' },
  ],
  reese: [
    { name: 'Rhys', lang: 'Welsh' },
    { name: 'Reece', lang: 'English' },
  ],
  sasha: [
    { name: 'Sacha', lang: 'French' },
    { name: 'Sascha', lang: 'German' },
  ],
  wren: [
    { name: 'Ren', lang: 'Japanese' },
  ],
  blair: [
    { name: 'Blaire', lang: 'English' },
  ],
  devon: [
    { name: 'Devin', lang: 'English' },
    { name: 'Devyn', lang: 'English' },
  ],
  grey: [
    { name: 'Gray', lang: 'English' },
  ],
  jordan: [
    { name: 'Jordyn', lang: 'English' },
  ],
  remy: [
    { name: 'Rémy', lang: 'French' },
    { name: 'Remi', lang: 'English' },
  ],
  taylor: [
    { name: 'Tayler', lang: 'English' },
  ],
  riley: [
    { name: 'Rylee', lang: 'English' },
    { name: 'Reilly', lang: 'Irish' },
  ],
  casey: [
    { name: 'Kasey', lang: 'English' },
  ],
  alex: [
    { name: 'Alix', lang: 'French' },
    { name: 'Aleks', lang: 'Russian' },
  ],
  charlie: [
    { name: 'Charley', lang: 'English' },
    { name: 'Charli', lang: 'English' },
  ],
  addison: [
    { name: 'Addisyn', lang: 'English' },
  ],
  ainsley: [
    { name: 'Ansley', lang: 'English' },
  ],
  bryn: [
    { name: 'Brynn', lang: 'English' },
  ],
  cameron: [
    { name: 'Camryn', lang: 'English' },
    { name: 'Kameron', lang: 'English' },
  ],
  emery: [
    { name: 'Emorie', lang: 'English' },
    { name: 'Emory', lang: 'English' },
  ],
  finley: [
    { name: 'Finlay', lang: 'Scottish' },
    { name: 'Finnley', lang: 'English' },
  ],
  jamie: [
    { name: 'Jaime', lang: 'Spanish' },
  ],
  jesse: [
    { name: 'Jessie', lang: 'English' },
  ],
  marley: [
    { name: 'Marlee', lang: 'English' },
  ],
  noel: [
    { name: 'Noelle', lang: 'French' },
    { name: 'Noël', lang: 'French' },
  ],
  peyton: [
    { name: 'Paityn', lang: 'English' },
  ],
  skyler: [
    { name: 'Skylar', lang: 'English' },
  ],
}

// De-duplicate variants within each entry
for (const key of Object.keys(NAME_VARIANTS)) {
  const seen = new Set<string>()
  NAME_VARIANTS[key] = NAME_VARIANTS[key]!.filter((v) => {
    if (seen.has(v.name)) return false
    seen.add(v.name)
    return true
  })
}

export function getVariants(name: string): NameVariant[] {
  return NAME_VARIANTS[name.toLowerCase()] ?? []
}
