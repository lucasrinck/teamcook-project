// FAUX client Supabase pour les tests : aucune requête ne part vers la vraie base.
//
// Principe (simple à expliquer) :
// - avant chaque test, on prépare une FILE de réponses avec queueResponses(...) ;
// - chaque appel à supabase.from('table') prend la réponse suivante de la file ;
// - toutes les méthodes (.select, .insert, .eq...) sont enregistrées dans "calls",
//   ce qui permet de vérifier ensuite ce que le serveur a demandé à la base.

type FakeResponse = {
  data: unknown;
  error: { code: string; message: string } | null;
};

type Call = { table: string; method: string; args: unknown[] };

const responses: FakeResponse[] = [];
export const calls: Call[] = [];

export function queueResponses(...items: FakeResponse[]) {
  responses.push(...items);
}

export function resetMock() {
  responses.length = 0;
  calls.length = 0;
}

// Méthodes du client Supabase utilisées par nos services
const METHODS = ['select', 'insert', 'update', 'upsert', 'delete', 'eq', 'order', 'single', 'maybeSingle', 'overrideTypes'];

function createQuery(table: string) {
  calls.push({ table, method: 'from', args: [] });
  const response = responses.shift() ?? { data: null, error: null };

  // Objet "chaînable" : chaque méthode renvoie le même objet,
  // et "await query" donne la réponse prévue (grâce à then).
  const query: Record<string, unknown> = {
    then(resolve: (value: FakeResponse) => void) {
      resolve(response);
    },
  };
  for (const method of METHODS) {
    query[method] = (...args: unknown[]) => {
      calls.push({ table, method, args });
      return query;
    };
  }
  return query;
}

export const fakeSupabase = {
  from: (table: string) => createQuery(table),
};

// Un lieu complet, au format renvoyé par l'API
export const sampleSpot = {
  id: 15,
  name: 'Spot de test',
  description: '[Démo] test',
  images: ['https://images.unsplash.com/photo-1502602898657-3e91760cbb34'],
  available: true,
  category: { id: 4, name: 'Lieux insolites', icon: 'moon-star', color: '#D4FF70' },
  infos: { address: 'Rue de Rivoli, 75001 Paris', city: 'Paris', latitude: 48.8606, longitude: 2.3376 },
};
