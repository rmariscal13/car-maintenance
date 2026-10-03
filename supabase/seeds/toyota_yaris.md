# Toyota Yaris: notas de la carga del catálogo

Fichero SQL: `supabase/seeds/toyota_yaris.sql`. Lo generó un script de Python a partir de una tabla de motorizaciones y un plan por generación. El fichero final es SQL plano. Lo validé con PGlite: el esquema más el seed se ejecutan dos veces seguidas sin errores, así que es idempotente.

Resultado: 18 motorizaciones, 333 tareas (89 de fabricante, 226 aproximadas, 18 de normativa por la ITV), 198 piezas y **0 referencias de marca** (ver "Piezas" más abajo).

## Árbol generación → motorizaciones

| Generación (TecDoc) | Motorización (`version`) | Años | Motor | kW / CV | Combustible |
|---|---|---|---|---|---|
| XP10 (_P1_) | 1.0 VVT-i 68 CV | 1999–2005 | 1SZ-FE (4 cil.) | 50 / 68 | gasolina |
| XP10 (_P1_) | 1.3 VVT-i 86 CV (2NZ-FE) | 1999–2003 | 2NZ-FE | 63 / 86 | gasolina |
| XP10 (_P1_) | 1.3 VVT-i 87 CV (2SZ-FE) | 2002–2005 | 2SZ-FE | 64 / 87 | gasolina |
| XP10 (_P1_) | 1.5 VVT-i TS 106 CV | 2001–2005 | 1NZ-FE | 78 / 106 | gasolina |
| XP10 (_P1_) | 1.4 D-4D 75 CV | 2002–2005 | 1ND-TV | 55 / 75 | diésel |
| XP90 (_P9_) | 1.0 VVT-i 69 CV | 2005–2011 | 1KR-FE (3 cil.) | 51 / 69 | gasolina |
| XP90 (_P9_) | 1.3 VVT-i 87 CV | 2005–2010 | 2SZ-FE | 64 / 87 | gasolina |
| XP90 (_P9_) | 1.33 Dual VVT-i 101 CV | 2008–2011 | 1NR-FE | 74 / 101 | gasolina |
| XP90 (_P9_) | 1.8 VVT-i TS 133 CV | 2007–2011 | 2ZR-FE | 98 / 133 | gasolina |
| XP90 (_P9_) | 1.4 D-4D 90 CV | 2005–2011 | 1ND-TV | 66 / 90 | diésel |
| XP130 (_P13_) | 1.0 VVT-i 69/72 CV | 2011–2020 | 1KR-FE | 51 (53 desde 2017) | gasolina |
| XP130 (_P13_) | 1.33 Dual VVT-i 99 CV | 2011–2017 | 1NR-FE | 73 / 99 | gasolina |
| XP130 (_P13_) | 1.5 Dual VVT-iE 111 CV | 2017–2020 | 2NR-FKE | 82 / 111 | gasolina |
| XP130 (_P13_) | 1.5 Hybrid 100 CV | 2012–2020 | 1NZ-FXE | 74 / 100 (sistema) | híbrido |
| XP130 (_P13_) | 1.4 D-4D 90 CV | 2011–2018 | 1ND-TV | 66 / 90 | diésel |
| XP210 (_P21_, _PA1_, _PH1_) | 1.5 Dynamic Force 125 CV | 2020– | M15A-FKS (3 cil.) | 92 / 125 | gasolina |
| XP210 (_P21_, _PA1_, _PH1_) | 1.5 Hybrid 116 CV | 2020– | M15A-FXE | 85 / 116 (sistema) | híbrido |
| XP210 (_P21_, _PA1_, _PH1_) | 1.5 Hybrid 130 CV | 2024– | M15A-FXE | 96 / 130 (sistema) | híbrido |

Todos los motores llevan **cadena de distribución**, también el diésel 1ND-TV. Por eso ningún Yaris tiene correa de distribución que cambiar. Hay una tarea informativa `cadena` en cada motorización.

Notas sobre los años:
- **XP10 1.3:** hubo dos motores. El 2NZ-FE fue el primero. TecDoc lo lista de 08.1999 a 11.2005, pero en la práctica se sustituyó por el 2SZ-FE (TecDoc: de 04.2002 a 09.2005). Los años de las filas son los aproximados de transición. Quien no esté seguro debe mirar el código del motor (en el bloque o en la ficha técnica, "SCP" = 2SZ, "NCP" = 2NZ).
- **XP130 1.0:** en 2017 pasó de 69 a 72 CV con el mismo motor y el mismo mantenimiento. Va en una sola fila con `power_kw` = 51.
- **XP210 Hybrid 130:** llegó con el restyling de 2024. Wikipedia lo fecha desde mayo de 2023 en Europa. El Hybrid 116 se sigue vendiendo.

## Qué intervalos son de fabricante y cuáles no

En todas las motorizaciones (salvo lo que se indica):

| Tarea | Intervalo | Tipo | Comentario |
|---|---|---|---|
| aceite | 15.000 km / 12 meses | fabricante | Toyota UK da "anual / 10.000 millas" para todas las generaciones, y la tabla europea dice 15.000 km o 12 meses (6 meses en uso severo). |
| frenos-liquido | 30.000 km / 24 meses | fabricante (XP90, XP130, XP210); aproximado (XP10) | La tabla Toyota dice "cada 24 meses" y el libro español del XP210 "2 años o 30.000 km". |
| refrigerante | 150.000 km / 120 meses | fabricante (XP90, XP130, XP210) | Super Long Life Coolant (rosa): el primer cambio es a los 150.000 km y luego cada 90.000 km. Los 120 meses salen de idgarages. |
| refrigerante XP10 | 60.000 km / 48 meses | aproximado | Depende de si lleva el refrigerante rojo o el rosa. Los planes de terceros dan entre 3 y 4 años. |
| bujías XP210 | 90.000 km | fabricante | Libro de mantenimiento del Yaris 2024 citado en el club español. No da plazo en años. |
| bujías XP90, XP130 | 90.000 km / 72 meses | aproximado | **Discrepancia:** el libro británico dice 6 años o 60.000 millas (≈96.000 km); la tabla europea no se pudo leer con seguridad (ver abajo); idgarages mete las bujías en la revisión de 60.000 km del Yaris II 1.0; CarWiki dice "60.000/90.000 km". En el `why` se recomienda cambiarlas a los 60.000 km para ir sobre seguro. |
| bujías XP10 | 60.000 km / 48 meses | aproximado | Solo hay planes de terceros (idgarages). |
| filtro-aire XP210 | 60.000 km / 48 meses | fabricante | Libro español del XP210. |
| filtro-aire XP90 | 45.000 km / 48 meses | aproximado | Un resumen de la tabla Toyota XP90 dijo "cambiar cada 45.000 km o 48 meses", pero no lo pude confirmar con una segunda lectura. |
| filtro-aire XP10, XP130 | 60.000 km / 48 meses | aproximado | |
| correa (accesorios) | revisar: primera vez a 105.000 km / 72 meses | fabricante (XP90, XP130, XP210 sin híbrido); aproximado (XP10) | La tabla Toyota (XP90 y XP130) y el libro español coinciden en una primera inspección a los 6 años y luego en cada revisión anual. Los 105.000 km solo los vi en el libro del XP210. El esquema guarda un solo intervalo, así que va la primera inspección y el resto se explica en `why`. Los híbridos no tienen esta tarea porque el libro dice "(no híbridos)". |
| valvulas | solo escuchar si hay ruido (info) | fabricante (XP90+ gasolina); aproximado (XP10) | Nota de la tabla Toyota: "Check for tappet noise and engine vibration and adjust if necessary". No se incluye en los diésel: la tabla no se leyó con claridad para el 1ND-TV. |
| cadena | sin cambio (info) | fabricante | El plan Toyota no tiene ninguna partida de cadena. |
| filtro-gasoil (1ND-TV) | 90.000 km / 72 meses | aproximado | La tabla Toyota (XP90/XP130) dice "Every 72 months"; los km salen de idgarages (Yaris I D-4D: 90.000 km / 72 meses). |
| filtro-gasolina | sin cambio (info) | aproximado | Va dentro del depósito con la bomba y no aparece en el plan Toyota del Yaris. |
| filtro-habitaculo | 30.000 km / 24 meses | aproximado | idgarages (Yaris II); la tabla Toyota no se pudo leer. |
| caja-cambios | revisar 60.000 km / 48 meses | aproximado | El plan británico de Toyota pone el aceite de caja a los 4 años o 40.000 millas (según un moderador del Toyota Owners Club), pero no está claro si es revisar o cambiar. |
| filtro-bateria-hibrida | limpiar 15.000 km / 12 meses | aproximado | Solo híbridos. Código nuevo: el Alto no lo tiene. |
| frenos, bajos, embrague, neumáticos, escobillas, batería | | aproximado | Prácticas habituales. |
| itv | | normativa | |

## Problema importante con la tabla de Toyota Europa

Las fuentes de fabricante más directas son dos PDF de mantenimiento de Toyota Europa: la tabla del XP130 en toyota-tech.eu y la del XP90 (copia en gerritspeek.nl). Solo pude leerlos con WebFetch. No hubo forma de descargarlos con curl, porque el proxy los bloquea. Esa herramienta resumía las tablas de forma contradictoria:
- **Bujías:** dio "Replace every 150.000 km" y, en otra lectura, R a los 75/82,5/90 mil km.
- **Líquido de frenos:** "cada 24 meses", pero también "primero a 120.000 km / 96 meses", que seguramente es otra fila mal asignada.
- **Distribución:** citó una fila "Timing Belt", pero son tablas plantilla de toda la gama Toyota, y el Yaris no lleva correa.

Por eso solo marqué como `fabricante` lo que coincidía con una segunda fuente: el libro español, Toyota UK o idgarages. Lo demás va como `aproximado`. **Conviene que alguien abra esos dos PDF a mano** y revise sobre todo las bujías (XP90/XP130), el filtro de aire, el filtro de habitáculo, el aceite de caja y el filtro de gasoil del D-4D. Si se confirman, se puede subir el `source_type` a `fabricante`.

## Piezas

- Hay piezas para aceite (filtro y aceite con viscosidad y litros), filtro de aire, habitáculo, bujías (con número de unidades), filtro de gasoil, líquido de frenos, refrigerante, pastillas delanteras, neumáticos, escobillas y batería.
- **No hay referencias de marca (part_refs) ni store_url.** No pude ver ninguna referencia MANN/BOSCH/NGK/DENSO en una fuente fiable para cada motorización concreta: los catálogos de tienda (Autodoc, etc.) exigen elegir vehículo y no salen en el texto descargable. Además, el proxy no deja usar curl. Todas las piezas van con `confidence = 'comprobar'` y una nota de "pídelo por matrícula/código de motor". Hay dos excepciones con `confirmado`: el líquido de frenos (DOT 3/DOT 4, según la tabla Toyota) y el refrigerante Toyota Super Long Life Coolant de XP90 en adelante (nota *4 de la tabla Toyota).
- Datos de referencia que vi pero no cargué como ref, porque no son de una motorización concreta: filtro de aceite Toyota 90915-YZZJ1 en un "Yaris 2018" (no dice el motor) y bujías originales SC20HR11 → SC16HR11 en el Yaris 2009 1.33 (Toyota Owners Club).
- **No se cargaron los recambios sueltos** (Bombillas, Visibilidad, Batería con medidas, etc.). Quedan pendientes.
- Neumáticos y frenos traseros: las medidas y el tipo (tambor o disco) varían según el acabado. Lo que hay en `specs` son las medidas habituales y está marcado para comprobar.

## Specs: lo que está confirmado y lo que no

- Capacidades de aceite: salen de oil-change.info (XP10, XP90 y XP130). La del 2SZ-FE (3,2 L con filtro) coincide con el manual citado en el Toyota Owners Club. **Sin capacidad confirmada:** 2NR-FKE, M15A-FKS y M15A-FXE.
- Viscosidades confirmadas: 0W-20 en el 1NR-FE (Toyota Owners Club); 5W-30 API SL/SM en el 2SZ-FE (manual citado); 0W-8 de fábrica en el Yaris Hybrid 2020+ (manual citado). Las demás son las habituales de cada motor y hay que comprobarlas en el manual.
- 1ND-TV con filtro de partículas (XP130 y parte del XP90): aceite bajo en cenizas (ACEA C2). Este dato es habitual, pero no lo confirmé.

## Fuera de alcance

- **Yaris Cross** (2021–) y **GR Yaris** (1.6 turbo G16E-GTS, 261 CV): excluidos por el encargo. El GR Yaris tiene un plan propio más exigente (Toyota UK: anual o 6.000 millas).
- **Yaris GRMN XP130** (1.8 sobrealimentado, serie limitada de 2018) y **Yaris Verso** (_P2_): no incluidos.
- **XP210 1.0 VVT-i 72 CV (1KR-FE):** se vendió en otros países europeos, pero Autofácil dice que no llegó a España. No está cargado.
- **XP90 1.0 con GLP:** aparece en la tabla Toyota, pero era para Italia. No está cargado.
- **XP210 1.5 125 CV con CVT:** existe en Europa, pero en España se lanzó solo con caja manual de 6, que es lo que se ha cargado.
- No hay plan específico de la "revisión del sistema híbrido" (Hybrid Health Check) de Toyota España. La batería de alta tensión no tiene mantenimiento programado.

## Fuentes

- Toyota Europe, tabla de mantenimiento Yaris XP130: https://www.toyota-tech.eu/MS/PDFS/0987cdaa5d81412da314c963e3b45482.pdf
- Toyota Europe, tabla de mantenimiento Yaris XP90 (copia): https://www.gerritspeek.nl/auto/diversen/yaris_maintenance_schedule.pdf
- Toyota UK, intervalos por generación: https://mag.toyota.co.uk/find-out-when-your-toyota-yaris-needs-a-service-whatever-its-age/comment-page-1/
- Club Toyota Yaris España (libro de mantenimiento del Yaris 2024 125 CV): https://www.clubtoyotayaris.es/threads/periodos-de-mantenimiento-acertados.3818/
- Toyota Owners Club, bujías Yaris 2009 1.33: https://www.toyotaownersclub.com/forums/topic/223604-2009-yaris-spark-plug-replacement-interval/
- Toyota Owners Club, bujías y aceite de caja: https://www.toyotaownersclub.com/forums/topic/177374-maintenance-schedule-spark-plugs-and-gearbox-oil/
- Toyota Owners Club, aceite 2006 1.3: https://www.toyotaownersclub.com/forums/topic/114257-engine-oil-capacity/
- Toyota Owners Club, 0W-20 en el 1NR-FE: https://toyotaownersclub.com/forums/topic/192648-oil-what-type
- Toyota Owners Club, 0W-8 en el Yaris Hybrid 2020+: https://www.toyotaownersclub.com/forums/topic/212082-first-service/
- Toyota Owners Club, códigos de motor: https://toyotaownersclub.com/forums/topic/95047-yaris-engine-codes
- Toyota Owners Club, filtros de aceite: https://toyotaownersclub.com/forums/topic/194337-oil-filters
- idgarages, Yaris I: https://www.idgarages.com/fr-fr/entretien/toyota/carnet-entretien-toyota-yaris
- idgarages, Yaris II: https://www.idgarages.com/fr-fr/entretien/toyota/carnet-entretien-toyota-yaris-2
- CarWiki.de: https://carwiki.de/?p=69398
- oil-change.info, capacidades: https://oil-change.info/toyota-yaris-engine-oil-capacity/
- Motor1 Italia, motores del Yaris: https://it.motor1.com/news/658563/toyota-yaris-motori-storia/
- Wikipedia, motores SZ: https://en.wikipedia.org/wiki/Toyota_SZ_engine
- Wikipedia, motores NZ: https://en.wikipedia.org/wiki/Toyota_NZ_engine
- Wikipedia, Yaris XP210: https://en.wikipedia.org/wiki/Toyota_Yaris_(XP210)
- Motorpasión, Yaris 125 en España: https://www.motorpasion.com/toyota/toyota-yaris-estrena-nueva-version-acceso-gasolina-125-cv-15-200-euros
- Autofácil, el 1.0 del XP210 no llegó a España: https://www.autofacil.es/nuevo-toyota-yaris-2021-basico/
- TecDoc (Schaeffler/rolling.hu): https://shop.rolling.hu/catalog/SCHAEFFLER/toyota-yaris-p1-13-ncp10-scp12, https://shop.rolling.hu/catalog/SCHAEFFLER/toyota-yaris-p1-13-scp12-scp13, https://shop.rolling.hu/catalog/SCHAEFFLER/toyota-yaris-p9-13-vvt-i-scp90, https://shop.rolling.hu/catalog/SCHAEFFLER/toyota-yaris-p9-133-vvt-i-nsp90, https://shop.rolling.hu/catalog/SCHAEFFLER/toyota-yaris-p13-13-nsp130
