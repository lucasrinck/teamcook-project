// Tests de l'API avec Vitest + Supertest.
// Supertest envoie de vraies requêtes HTTP à l'application Express,
// mais le client Supabase est remplacé par un faux (voir supabaseMock.ts).
import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { fakeSupabase, queueResponses, resetMock, calls, sampleSpot } from './supabaseMock.js';

// Remplace le module config/supabase par notre faux client, AVANT d'importer l'app
vi.mock('../src/config/supabase.js', () => ({ supabase: fakeSupabase }));

const { default: app } = await import('../src/app.js');

const TOKEN = 'test-admin-token-123456'; // le même que dans vitest.config.ts

// Corps valide pour POST et PUT
const validBody = {
  name: 'Spot de test',
  category_id: 4,
  description: '[Démo] test',
  images: ['https://images.unsplash.com/photo-1502602898657-3e91760cbb34'],
  available: true,
  address: 'Rue de Rivoli, 75001 Paris',
  city: 'Paris',
  latitude: 48.8606,
  longitude: 2.3376,
};

// Liste des champs en erreur dans une réponse 400
function errorFields(body: { details?: { field: string }[] }) {
  return (body.details ?? []).map((detail) => detail.field);
}

beforeEach(() => {
  resetMock();
  vi.spyOn(console, 'error').mockImplementation(() => {}); // garde la sortie des tests lisible
});

describe('GET /api/spots', () => {
  it('renvoie 200 et la liste des lieux', async () => {
    queueResponses({ data: [sampleSpot], error: null });

    const res = await request(app).get('/api/spots');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([sampleSpot]);
  });
});

describe('POST /api/spots', () => {
  it('renvoie 201 avec le lieu créé quand les données sont valides', async () => {
    queueResponses(
      { data: { id: 15 }, error: null }, // 1. insert dans spots
      { data: null, error: null }, //       2. insert dans spot_infos
      { data: sampleSpot, error: null }, // 3. relecture du lieu complet
    );

    const res = await request(app).post('/api/spots').set('x-admin-token', TOKEN).send(validBody);

    expect(res.status).toBe(201);
    expect(res.body).toEqual(sampleSpot);
    // La fiche spot_infos a bien été créée avec le spot_id du nouveau lieu
    const infosInsert = calls.find((call) => call.table === 'spot_infos' && call.method === 'insert');
    expect(infosInsert?.args[0]).toMatchObject({ spot_id: 15, city: 'Paris' });
  });

  it.each([
    ['nom vide', { name: '   ' }, 'name'],
    ['latitude hors bornes', { latitude: 200 }, 'latitude'],
    ["image qui n'est pas une URL", { images: ['pas-une-url'] }, 'images.0'],
    ['image en ftp', { images: ['ftp://exemple.com/photo.jpg'] }, 'images.0'],
    ['champ inattendu', { admin: true }, 'admin'],
  ])('renvoie 400 si %s', async (_label, change, field) => {
    const res = await request(app)
      .post('/api/spots')
      .set('x-admin-token', TOKEN)
      .send({ ...validBody, ...change });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(errorFields(res.body)).toContain(field);
    expect(calls).toHaveLength(0); // la base n'a jamais été appelée
  });

  it('renvoie 400 si la ville est manquante', async () => {
    const { city, ...bodyWithoutCity } = validBody;

    const res = await request(app).post('/api/spots').set('x-admin-token', TOKEN).send(bodyWithoutCity);

    expect(res.status).toBe(400);
    expect(errorFields(res.body)).toContain('city');
  });

  it('renvoie 400 si le formulaire est vide', async () => {
    const res = await request(app).post('/api/spots').set('x-admin-token', TOKEN).send({});

    expect(res.status).toBe(400);
    expect(errorFields(res.body)).toEqual(['name', 'category_id', 'city', 'latitude', 'longitude']);
  });

  it("renvoie 400 si category_id ne correspond à aucune catégorie (erreur PostgreSQL 23503)", async () => {
    queueResponses({ data: null, error: { code: '23503', message: 'foreign key violation' } });

    const res = await request(app)
      .post('/api/spots')
      .set('x-admin-token', TOKEN)
      .send({ ...validBody, category_id: 999 });

    expect(res.status).toBe(400);
    expect(res.body.details).toEqual([{ field: 'category_id', message: "Cette catégorie n'existe pas" }]);
  });

  it("supprime le lieu créé si l'insertion dans spot_infos échoue", async () => {
    queueResponses(
      { data: { id: 15 }, error: null }, //                             1. insert spots : OK
      { data: null, error: { code: '23514', message: 'check failed' } }, // 2. insert spot_infos : ÉCHEC
      { data: null, error: null }, //                                    3. delete du lieu
    );

    const res = await request(app).post('/api/spots').set('x-admin-token', TOKEN).send(validBody);

    expect(res.status).toBe(500);
    // Le serveur a bien supprimé le lieu n°15 dans la table spots
    const deleteCall = calls.find((call) => call.table === 'spots' && call.method === 'delete');
    expect(deleteCall).toBeDefined();
    expect(calls).toContainEqual({ table: 'spots', method: 'eq', args: ['id', 15] });
  });
});

describe('PUT /api/spots/:id', () => {
  it('renvoie 200 avec le lieu modifié', async () => {
    queueResponses(
      { data: { name: 'Ancien nom' }, error: null }, // 0. lecture de l'ancienne version
      { data: null, error: null }, //                  1. update spots
      { data: null, error: null }, //                  2. upsert spot_infos
      { data: { ...sampleSpot, name: 'Nouveau nom' }, error: null }, // 3. relecture
    );

    const res = await request(app)
      .put('/api/spots/15')
      .set('x-admin-token', TOKEN)
      .send({ ...validBody, name: 'Nouveau nom' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Nouveau nom');
    // upsert sur spot_id : la fiche est créée si elle n'existait pas
    const upsertCall = calls.find((call) => call.method === 'upsert');
    expect(upsertCall?.args[1]).toEqual({ onConflict: 'spot_id' });
  });

  it("renvoie 404 si le lieu n'existe pas", async () => {
    queueResponses({ data: null, error: null }); // la lecture ne trouve rien

    const res = await request(app).put('/api/spots/999').set('x-admin-token', TOKEN).send(validBody);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Lieu introuvable');
  });

  it('renvoie 400 si les données sont invalides', async () => {
    const res = await request(app)
      .put('/api/spots/15')
      .set('x-admin-token', TOKEN)
      .send({ ...validBody, longitude: -500 });

    expect(res.status).toBe(400);
    expect(errorFields(res.body)).toContain('longitude');
  });
});

describe('DELETE /api/spots/:id', () => {
  it('renvoie 204 sans corps de réponse', async () => {
    queueResponses({ data: [{ id: 15 }], error: null }); // une ligne supprimée

    const res = await request(app).delete('/api/spots/15').set('x-admin-token', TOKEN);

    expect(res.status).toBe(204);
    expect(res.text).toBe('');
  });

  it("renvoie 404 si le lieu n'existe pas", async () => {
    queueResponses({ data: [], error: null }); // aucune ligne supprimée

    const res = await request(app).delete('/api/spots/999').set('x-admin-token', TOKEN);

    expect(res.status).toBe(404);
  });
});

describe('Identifiant dans l’URL', () => {
  it.each(['abc', '0', '-3', '1.5'])('renvoie 400 pour l’id "%s"', async (id) => {
    const res = await request(app).delete(`/api/spots/${id}`).set('x-admin-token', TOKEN);

    expect(res.status).toBe(400);
    expect(errorFields(res.body)).toEqual(['id']);
    expect(calls).toHaveLength(0);
  });
});

describe('Protection par token (requireAdmin)', () => {
  const writeRoutes = [
    ['POST', '/api/spots'],
    ['PUT', '/api/spots/1'],
    ['DELETE', '/api/spots/1'],
    ['PATCH', '/api/spots/1/availability'],
  ];

  it.each(writeRoutes)('%s %s sans token renvoie 401', async (method, url) => {
    const res = await request(app)[method.toLowerCase() as 'post'](url).send(validBody);

    expect(res.status).toBe(401);
    expect(calls).toHaveLength(0); // la base n'a jamais été appelée
  });

  it.each(writeRoutes)('%s %s avec un mauvais token renvoie 401', async (method, url) => {
    const res = await request(app)[method.toLowerCase() as 'post'](url)
      .set('x-admin-token', 'mauvais-token')
      .send(validBody);

    expect(res.status).toBe(401);
    expect(calls).toHaveLength(0);
  });
});

describe('Routes complémentaires', () => {
  it('GET /api/health renvoie 200', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/categories renvoie 200', async () => {
    queueResponses({ data: [sampleSpot.category], error: null });

    const res = await request(app).get('/api/categories');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([sampleSpot.category]);
  });

  it('GET /api/spots/:id renvoie 200 ou 404', async () => {
    queueResponses({ data: sampleSpot, error: null }, { data: null, error: null });

    expect((await request(app).get('/api/spots/15')).status).toBe(200);
    expect((await request(app).get('/api/spots/999')).status).toBe(404);
  });

  it('PATCH /api/spots/:id/availability met à jour la disponibilité', async () => {
    queueResponses(
      { data: [{ id: 15 }], error: null }, //                   update spots
      { data: { ...sampleSpot, available: false }, error: null }, // relecture
    );

    const res = await request(app)
      .patch('/api/spots/15/availability')
      .set('x-admin-token', TOKEN)
      .send({ available: false });

    expect(res.status).toBe(200);
    expect(res.body.available).toBe(false);
    expect(calls).toContainEqual({ table: 'spots', method: 'update', args: [{ available: false }] });
  });

  it('PATCH /api/spots/:id/availability refuse un corps invalide (400)', async () => {
    const res = await request(app)
      .patch('/api/spots/15/availability')
      .set('x-admin-token', TOKEN)
      .send({ available: 'oui' });

    expect(res.status).toBe(400);
    expect(errorFields(res.body)).toEqual(['available']);
  });

  it('PATCH /api/spots/:id/availability renvoie 404 si le lieu n’existe pas', async () => {
    queueResponses({ data: [], error: null });

    const res = await request(app)
      .patch('/api/spots/999/availability')
      .set('x-admin-token', TOKEN)
      .send({ available: true });

    expect(res.status).toBe(404);
  });
});
