-- Suzuki Alto GF: el plan del Nissan Pixo (mismo coche) pasa a ser la fuente principal.
-- Lo que solo venía del manual del Celerio no se pudo leer con seguridad y queda como aproximado.
-- Decidido con Ruben el 3 oct 2026.
-- Aplicado en Supabase el 3 oct 2026 con el editor SQL (sentencias equivalentes).

update maintenance_tasks set interval_km=15000, interval_months=12, source_type='gemelo',
  why='Plan del Nissan Pixo: aceite y filtro cada 15.000 km o 1 año.'
  where model_id='suzuki-alto-gf-10' and code='aceite';

update maintenance_tasks set interval_km=45000, interval_months=36, source_type='gemelo',
  why='Plan del Nissan Pixo: en la revisión general, cada 45.000 km o 3 años. En zonas con polvo, antes.'
  where model_id='suzuki-alto-gf-10' and code='filtro-aire';

update maintenance_tasks set interval_km=45000, interval_months=36, source_type='gemelo',
  why='Plan del Nissan Pixo: en la revisión general, cada 45.000 km o 3 años.'
  where model_id='suzuki-alto-gf-10' and code='bujias';

update maintenance_tasks set why='Plan del Nissan Pixo: cada 45.000 km o 3 años. Si notas olor o que sale poco aire por las rejillas, cámbialo antes.'
  where model_id='suzuki-alto-gf-10' and code='filtro-habitaculo';

update maintenance_tasks set why='Plan del Nissan Pixo: cada 30.000 km o 2 años. Absorbe humedad con el tiempo, así que cada 2 años aunque hagas pocos km.'
  where model_id='suzuki-alto-gf-10' and code='frenos-liquido';

update maintenance_tasks set why='Plan del Nissan Pixo: cada 45.000 km o 3 años.'
  where model_id='suzuki-alto-gf-10' and code='refrigerante';

update maintenance_tasks set interval_km=15000, interval_months=12, source_type='gemelo',
  why='Plan del Nissan Pixo: los frenos se revisan en cada revisión (15.000 km o 1 año). Cambiar pastillas con menos de 3 mm de material.'
  where model_id='suzuki-alto-gf-10' and code='frenos-delanteros';

update maintenance_tasks set why='Plan del Nissan Pixo: cambio cada 90.000 km o 6 años. Conviene mirar grietas y tensión en cada revisión.'
  where model_id='suzuki-alto-gf-10' and code='correa';

update maintenance_tasks set source_type='aproximado',
  why='El plan del Nissan Pixo no la menciona. El manual del Celerio (mismo motor) parece pedir revisarla cada 40.000 km, pero no lo pude leer con seguridad. Trabajo de taller.'
  where model_id='suzuki-alto-gf-10' and code='valvulas';

update maintenance_tasks set why='Plan del Nissan Pixo: a los 105.000 km. Va dentro del depósito, junto a la bomba.'
  where model_id='suzuki-alto-gf-10' and code='filtro-gasolina';

update maintenance_tasks set interval_km=165000, interval_months=null, source_type='gemelo',
  why='Plan del Nissan Pixo: vaciado de la caja a los 165.000 km. Aceite Suzuki Gear Oil 75W-80.'
  where model_id='suzuki-alto-gf-10' and code='caja-cambios';

update maintenance_tasks set source_type='aproximado',
  why='En el taller: tubo de escape, suspensión, dirección, fuelles de los palieres, tubos y latiguillos de freno, freno de mano y tuberías de gasolina. El plan del Pixo revisa frenos y suspensión en cada revisión; el plazo de 40.000 km o 2 años para el resto es orientativo.'
  where model_id='suzuki-alto-gf-10' and code='revision-bajos';

update maintenance_tasks set source_type='aproximado',
  why='Comprobar el juego del pedal y el ajuste del cable. Plazo orientativo: el plan del Pixo no lo detalla. Si patina o el pedal está muy alto, al taller.'
  where model_id='suzuki-alto-gf-10' and code='embrague';

update model_sources set title='Manual Suzuki Celerio (Europa), mismo motor K10B, págs. 275–277. Solo de referencia: no se pudo leer la tabla con seguridad'
  where model_id='suzuki-alto-gf-10' and url like '%manualslib%';
update model_sources set title='Plan de mantenimiento del Nissan Pixo 1.0 (mismo coche que el Alto GF). Fuente principal'
  where model_id='suzuki-alto-gf-10' and url like '%idgarages%';
