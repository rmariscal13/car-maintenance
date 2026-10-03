# Renault Kangoo: notas del catálogo

Fichero SQL: `supabase/seeds/renault_kangoo.sql`. Lo genera un script en Python y es SQL plano, idempotente (`begin; delete …; insert …; commit;`). Lo he probado en PGlite con el esquema `20261003081127_initial_schema.sql`, dos veces seguidas.

Cada fila cubre el turismo (Kangoo, Grand Kangoo, Be Bop) y el furgón (Express, Van) cuando comparten motor y plan. Son 33 motorizaciones.

Gemelo: el **Mercedes Citan** (W415 2012–2021 y W420 2021–) monta los mismos K9K, H5F y H5H. No lo he usado como fuente de intervalos. Solo aparece una referencia Mercedes (A6081840100) como equivalente del filtro de aceite del Blue dCi.

## Árbol

### Kangoo I: KC0/1 (furgón FC0/1), 1997–2008
| id | motor | código | CV (kW) | años |
|---|---|---|---|---|
| kc-12-60 | 1.2 8V | D7F | 58–60 (43) | 1997–2003 |
| kc-12-16v-75 | 1.2 16V | D4F 712/730 | 75 (55) | 2001–2008 |
| kc-14-75 | 1.4 8V | E7J (hasta 2000) / K7J | 75 (55) | 1997–2003 |
| kc-16-16v-95 | 1.6 16V (también 4x4) | K4M 750/752/753 | 95 (70) | 2001–2008 |
| kc-19-d-55 | 1.9 D | F8Q | 55 (40) | 1997–2003 |
| kc-19-d-65 | 1.9 D (furgón) | F8Q | 65 (47) | 1997–2003 |
| kc-19-dti-80 | 1.9 dTi | F9Q 780/782 | 80 (59) | 2000–2002 |
| kc-19-dci-80 | 1.9 dCi 4x4 | F9Q 790 | 80 (59) | 2001–2003 |
| kc-19-dci-85 | 1.9 dCi (y 4x4) | F9Q 790 | 84–85 (62) | 2003–2008 |
| kc-15-dci-57 | 1.5 dCi | K9K 704 | 57 (42) | 2002–2008 |
| kc-15-dci-65 | 1.5 dCi | K9K 700/704 | 65 (48) | 2001–2005 |
| kc-15-dci-70 | 1.5 dCi | K9K 714 | 68–70 (50) | 2005–2008 |
| kc-15-dci-82 | 1.5 dCi | K9K 702/710 | 82 (60) | 2003–2005 |
| kc-15-dci-85 | 1.5 dCi | K9K 716/718 | 84–85 (62) | 2005–2008 |

### Kangoo II: KW0/1 (furgón FW0/1), 2008–2021
| id | motor | código | CV (kW) | años |
|---|---|---|---|---|
| kw-16-90 | 1.6 8V | K7M | 87–90 (64) | 2008–2013 |
| kw-16-16v-105 | 1.6 16V | K4M 830/832 | 105–106 (78) | 2008–2013 |
| kw-12-tce-115 | 1.2 TCe | H5F 400/408/412 | 115 (84) | 2013–2021 |
| kw-15-dci-70 | 1.5 dCi sin FAP | K9K 800/802 | 68–70 (50) | 2008–2011 |
| kw-15-dci-85 | 1.5 dCi sin FAP | K9K | 85–86 (63) | 2008–2011 |
| kw-15-dci-105 | 1.5 dCi FAP | K9K 804/806 | 103–106 (78) | 2008–2010 |
| kw-15-dci-75 | 1.5 dCi FAP | K9K (802…) | 75 (55) | 2010–2021 |
| kw-15-dci-90 | 1.5 dCi FAP | K9K 808/608/612/628, K9K 647 desde 2017 | 90 (66–67) | 2009–2021 |
| kw-15-dci-110 | 1.5 dCi FAP | K9K | 110 (80–81) | 2010–2021 |
| kw-15-bluedci-80/95/115 | 1.5 Blue dCi | K9K (872 en el 115) | 80/95/115 (59/70/85) | 2019–2021 |
| kw-ze | Z.E. eléctrico | (motor síncrono) | 60 (44) | 2011–2021 |

### Kangoo III: KJ (furgón FJ), 2021–
| id | motor | código | CV (kW) | años |
|---|---|---|---|---|
| k3-13-tce-100 | 1.3 TCe | H5H | 100–102 (75) | 2021– |
| k3-13-tce-130 | 1.3 TCe | H5H | 130–131 (96) | 2021– |
| k3-15-bluedci-75/95/115 | 1.5 Blue dCi | K9K 876 | 75/95/115 (55/70/85) | 2021– |
| k3-e-tech | E-Tech Electric | (eléctrico) | 122 (90) | 2022– |

Los años finales del Kangoo I y la fecha en que se dejó de vender cada versión en España son aproximados. Autodoc da rangos «hasta hoy» que no sirven para esto, así que los he puesto a partir de las fases conocidas del modelo.

## Correa de distribución por motor
| motor | plazo puesto | tipo | de dónde sale |
|---|---|---|---|
| D7F 1.2 8V | 120.000 km / 5 años | fabricante | Haynes, Kangoo I D7F-722/726/766 (también 2000–2002). Coincide con L'argus y con el carnet del Clio II 1.2 |
| D4F 1.2 16V | 120.000 km / 5 años | fabricante | Haynes, Kangoo I D4F-712/730. Coincide con Actu-Automobile (Clio D4F) |
| E7J/K7J 1.4 | 120.000 km / 5 años | aproximado | L'argus (recopilación de foro) y foro Planète Renault (Kangoo 1.4 de 2000). No he leído ningún documento Renault |
| K4M 1.6 16V (KC) | 120.000 km / 5 años | aproximado | El carnet del Kangoo II K4M da 120.000 km / **6 años**. Para el KC pongo 5 años por prudencia. Haynes no llega a mostrar el K4M del KC (la página se corta) |
| K4M 1.6 16V (KW) | 120.000 km / 6 años | fabricante | Carnet idgarages del Kangoo II 1.6 16V 105 |
| K7M 1.6 8V (KW) | 120.000 km / 4 años | aproximado | Solo el Dacia Logan 1.6 MPI (mismo motor) en L'argus. Ni siquiera está confirmado que se vendiera en España |
| F8Q 1.9 D | 120.000 km / 5 años | gemelo | Carnet idgarages del Clio II 1.9 D 55 (mismo F8Q y misma época), más L'argus |
| F9Q dTi/dCi | 120.000 km / 5 años | aproximado | Foro Planète Renault (Kangoo 1.9 dCi), sin documento. En otro hilo hablan de **75.000 km** para un dTi. Discrepancia sin resolver |
| K9K (KC 2001–2008) | 120.000 km / 5 años | aproximado | L'argus (Clio 1.5 dCi 65–85) y foros. Desde 2006 aprox. Renault lo subió a 160.000 km / 6 años (Actu-Automobile; Haynes da 160.000/72 al K9K-806 desde 01/2007). Los KC de 2006–2008 pueden tener ya 160.000/6 en su libro. Puse el plazo corto |
| K9K (KW 2008–2018) | 160.000 km / 6 años | fabricante (dCi 70 y dCi 105), aproximado (resto) | Carnet idgarages del dCi 70, Haynes del dCi 105 FAP y Actu-Automobile |
| K9K Blue dCi (KW 2019– y Kangoo III) | 160.000 km / 6 años | aproximado | **No he encontrado el plazo Renault.** El plan Haynes del Kangoo III no muestra el cambio en sus tablas (o sea, es mayor de lo que cubren). Lo dejo igual que los K9K anteriores |
| H5F 1.2 TCe, H5H 1.3 TCe | cadena, sin cambio | info | Haynes no tiene tarea de distribución. Al H5F se le añade un aviso por el consumo de aceite y el estiramiento de la cadena |

En los K9K el kit cambia según el año: 123 dientes hasta ~2016 y 119 dientes en el K9K 647 (dCi 90 desde 2017). Está puesto en las notas de las piezas.

## Plan por motorización (qué es de fabricante y qué no)

- **D7F (kc-12-60) y D4F (kc-12-16v-75)**: son de **fabricante (Haynes)** el aceite (30.000 km / 2 años), el filtro de aire (30.000 km; uso 2 años porque Haynes da 2 o 4 según el año), el filtro de polen (30.000 km / 2 años), las bujías (60.000 km), la distribución y el líquido de frenos (4 años / 120.000 km). En el D7F, la correa de accesorios y el refrigerante (4 años / 120.000 km) salen del **Clio II 1.2 (gemelo)**. En el D4F esas dos tareas son aproximadas. Los D7F fabricados hasta 10/2000 tenían el aceite a 20.000 km. Está explicado en el campo why.
- **E7J/K7J (kc-14-75) y K4M del KC (kc-16-16v-95)**: todo es **aproximado**. Copian el plan Renault de los 1.2 del KC, porque Haynes corta la página antes de estos motores.
- **F8Q (kc-19-d-55/65)**: todo sale del plan del **Clio II 1.9 D 55 (gemelo)** en idgarages: aceite a 15.000 km / 1 año; aire y gasoil a 30.000 km / 2 años; polen en cada revisión; correa a 120.000 / 5; líquido de frenos y refrigerante a 60.000 km / 4 años.
- **F9Q (dTi y dCi)**: todo **aproximado**. Para el aceite del dTi tomo el plazo del F8Q (15.000 / 1 año); para el dCi, 20.000 / 1 año.
- **K9K del KC**: todo **aproximado**. Tomo el aceite del dCi 70 sin FAP del KW (20.000 km / 1 año), que es el mismo motor.
- **K4M del KW (kw-16-16v-105)**: todo de **fabricante** (carnet idgarages): aceite a 30.000 km / 1 año; aire y bujías a 90.000 / 4; distribución y accesorios a 120.000 / 6; frenos a 120.000 / 4; refrigerante a 150.000 / 6.
- **K7M del KW (kw-16-90)**: todo **aproximado**. Le he añadido la tarea de válvulas (sin taqués hidráulicos) como aviso.
- **H5F 1.2 TCe**: de **fabricante (Haynes)** el aceite (30.000 / 2), el aire (90.000 / 4), el polen (30.000), las bujías (60.000 / 4) y los frenos (120.000 / 4). La correa de accesorios y el refrigerante son aproximados.
- **K9K dCi 70 sin FAP**: todo de **fabricante** (carnet idgarages): aceite a 20.000 / 1; polen a 40.000; gasoil a 60.000; aire a 80.000; distribución, accesorios y refrigerante a 160.000 / 6; frenos a 120.000 / 4. El **dCi 85 sin FAP** usa el mismo plan, pero marcado aproximado.
- **K9K dCi 105 FAP**: de **fabricante (Haynes)** el aceite (30.000 / 2; hasta 01/2009 era 1 año), el aire (60.000 / 4), el polen (30.000), la distribución (160.000 / 6) y los frenos. El gasoil, los accesorios y el refrigerante son aproximados. Los **dCi 75/90/110 FAP** usan este mismo plan, todo marcado aproximado.
- **Blue dCi del KW**: todo **aproximado**. Tomo el plan del Kangoo III. Añado una tarea informativa `adblue`.
- **Kangoo III (TCe y Blue dCi)**: de **fabricante (Haynes)** el aceite (30.000 / 2), el aire (60.000 / 4), el polen (30.000 / 2), los frenos (120.000 / 4), las bujías del TCe (90.000 / 4) y el refrigerante (solo revisar). Para el mismo H5H en el Renault Express, Haynes da el aire a 90.000 km; uso el dato del Kangoo. El gasoil y la distribución del Blue dCi son aproximados.
- **Eléctricos (Z.E. y E-Tech)**: todo **aproximado**. No he encontrado el plan Renault. Pongo revisión anual en el Z.E. y cada 2 años / 30.000 km en el E-Tech, más el polen, el líquido de frenos a 4 años y la batería de 12 V.
- **Común a todos (aproximado)**: frenos delanteros y traseros, neumáticos, escobillas, batería, revisión de bajos y caja de cambios (info: sin cambio programado, no confirmado). La **ITV** (normativa) explica en el why la diferencia entre turismo (4-2-1) y furgón N1 (2 años, bienal hasta 6, anual de 6 a 10 y semestral desde 10). Ojo: si la app aplica a `special='itv'` siempre la regla de turismo, los furgones quedan mal calculados.

Códigos de tarea nuevos que no aparecen en el Alto: `distribucion` (correa), `cadena` (info, como en el Alto), `adblue` (info), `revision` (eléctricos) y `filtro-gasoil`.

## Piezas
Solo he puesto referencias de marca que he visto en Autodoc.es para esa motorización concreta:
- Filtro de aceite: D7F (MAHLE OC 475, BOSCH 0 451 104 025, PURFLUX LS924), K9K 704 del dCi 57 KC (MANN W 75/3, MAHLE OC 467, BOSCH 0 451 103 336, PURFLUX LS932), K9K 808 del dCi 90 KW (MANN W 79 / W 7032, MAHLE OC 727, BOSCH F 026 407 022, PURFLUX LS933) y K9K 872 Blue dCi 115 KW (cartucho: MANN HU 618 y, MAHLE OX 1308D, PURFLUX L1089, UFI 25.267.00).
- Kit de distribución: K9K 714 del dCi 70 KC y K9K 802 del dCi 75 KW (123 dientes: GATES K025578XS, CONTITECH CT1035K2, SKF VKMA 06134, DAYCO KTB532; con bomba: GATES KP25578XS, SKF VKMC 06134-2, INA 530 0197 31, DAYCO KTBWP5320); K4M del KC con bomba (GATES KP35501XS, CONTITECH CT1179WP3, SKF VKMC 06020, INA 530 0640 30, DAYCO KTBWP4601); correa del K9K 647 (GATES 5675XS, CONTITECH CT1184, DAYCO 941096).
- Las referencias salen de resúmenes de WebFetch de las páginas de Autodoc, no de una lectura directa. En el dTi el resumen dio una referencia BOSCH repetida de otro motor, así que lo dejé sin refs.
- El resto de piezas va sin refs y con `comprobar`. Tienen store_url solo cuando la URL de Autodoc salió en una búsqueda o la abrí, y corresponde a esa versión.
- Bombillas: en el KW, H4 55 W anti-UV, W5W y PY21W, confirmadas en el manual Renault Kangoo II fase 2 (no pude abrir la página de los pilotos traseros). En el KC, H4 con `comprobar`. En el Kangoo III queda un aviso genérico (faros LED según acabado).
- Capacidades de aceite: van «unos X L» de memoria aproximada; no las he confirmado (el manual Renault remite al carnet). Normas de aceite: RN0700/RN0710/RN0720/RN17 según época, también aproximadas, salvo RN0720 en dCi con FAP (foro Planète Renault).
- Neumáticos y frenos: medidas habituales con aviso de mirar la etiqueta de la puerta. No he puesto neumáticos como pieza.

## Pendiente / no confirmado
1. El plazo Renault de la correa del **Blue dCi** (KW 2019–2021 y Kangoo III). Es lo más importante que queda abierto.
2. El plan oficial de **K4M (KC), E7J/K7J, F9Q, K9K (KC)**: la página Haynes del Kangoo I se corta antes de esos motores y no hay carnet de idgarages del Kangoo I.
3. **F9Q dTi**: hay una discrepancia de 120.000 frente a 75.000 km.
4. **K9K del KC de 2006–2008**: puede que ya tengan 160.000 km / 6 años.
5. **K7M (KW 1.6 8V 90 CV)**: no sé si se vendió en España.
6. Versiones que he dejado fuera: 1.6 16V bivalente GNC (KC), 1.6 16V GLP y FLEX/etanol (KW), 1.6 SCe 116 (FW17), motores 1.0 y 1.6 8V de Brasil/Argentina y el Kangoo Elect'road (KC eléctrico, muy raro).
7. Eléctricos: no tengo el plan de mantenimiento Renault ni el código de motor (los dejo con `engine_code` null).
8. Faltan referencias de filtros de aire, habitáculo y gasoil, bujías y pastillas.

## Fuentes
- Haynes, Kangoo I: https://uk.haynes.com/pages/maintenance-plans-car-renault-kangoo-i-1997-2018
- Haynes, Kangoo II: https://uk.haynes.com/pages/maintenance-plans-car-renault-kangoo-ii-2008-2025
- Haynes, Kangoo III: https://uk.haynes.com/pages/maintenance-plans-car-renault-kangoo-iii-2021-2025
- Haynes, Renault Express (H5H): https://uk.haynes.com/pages/maintenance-plans-car-renault-express-2020-2025
- idgarages, carnet Kangoo II: https://www.idgarages.com/fr-fr/entretien/renault/carnet-entretien-renault-kangoo-2
- idgarages, carnet Clio II (F8Q, D7F): https://www.idgarages.com/fr-fr/entretien/renault/carnet-entretien-renault-clio-2
- L'argus, recopilación de plazos de correa: https://www.largus.fr/forum-auto/tutoriels-et-topics-de-reference/tuto-preconisations-changement-courroies-de-distribution/243826.html
- Actu-Automobile, correa del Clio: https://www.actu-automobile.com/2021/09/29/le-changement-de-courroie-de-distribution-sur-renault-clio/
- Planète Renault, 1.9 dCi: https://www.planeterenault.com/forum/kangoo-i-frequence-de-remplacement-courroie-distribution-1-9-dci-t20786.html?amp=1
- Planète Renault, 1.4: https://www.planeterenault.com/forum/kangoo-i-distribution-t6359.html?amp=1
- Planète Renault, dTi a 75.000 km: https://www.planeterenault.com/forum/post207946.html
- Renault Francia, distribución en general: https://www.renault.fr/entretien/distribution.html
- Manual Renault Kangoo II fase 2: https://www.user-manual.renault.com/lt/notice/8529/index (motores: /lt/node/8638; bombillas: /lt/node/8622)
- Carwiki, inspección del Kangoo: https://carwiki.de/renault-kangoo-inspektion
- Autodoc, catálogos: …/kangoo-express-fc0-1, …/kangoo-grand-kangoo-kw0-1, …/kangoo-express-fw0-1, …/kangoo-iii-monospace, …/kangoo-iii-furgoneta-monovolumen (más las páginas de pieza concretas citadas en el SQL)
