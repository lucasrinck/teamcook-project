// Vérifie la connexion à Supabase, en LECTURE SEULE.
// Usage : npm run check:db -w server
// Affiche le contenu existant pour aligner les identifiants du seed.
// N'affiche jamais les clés.
import { supabase } from '../src/config/supabase.js';

async function main() {
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name, icon, color')
    .order('id');

  if (categoriesError) {
    console.error('❌ Connexion impossible :', categoriesError.message);
    process.exit(1);
  }

  const { data: spots, error: spotsError } = await supabase
    .from('spots')
    .select('id, name, spot_infos(id)')
    .order('id');

  const { count: infosCount, error: infosError } = await supabase
    .from('spot_infos')
    .select('id', { count: 'exact', head: true });

  if (spotsError || infosError) {
    console.error('❌ Lecture impossible :', (spotsError ?? infosError)?.message);
    process.exit(1);
  }

  console.log('✅ Connexion Supabase OK\n');

  console.log(`categories : ${categories.length} ligne(s)`);
  for (const category of categories) {
    console.log(`  #${category.id}  ${category.name}  (icon: ${category.icon ?? '-'}, color: ${category.color ?? '-'})`);
  }

  console.log(`\nspots : ${spots.length} ligne(s)`);
  for (const spot of spots) {
    const hasInfos = spot.spot_infos !== null && (!Array.isArray(spot.spot_infos) || spot.spot_infos.length > 0);
    console.log(`  #${spot.id}  ${spot.name}${hasInfos ? '' : '  ⚠️ sans fiche spot_infos'}`);
  }

  console.log(`\nspot_infos : ${infosCount ?? 0} ligne(s)`);
}

main();
