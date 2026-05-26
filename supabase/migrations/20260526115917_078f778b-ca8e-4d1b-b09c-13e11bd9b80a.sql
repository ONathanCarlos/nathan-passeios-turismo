
UPDATE public.pacotes SET
  descricao_pt = CASE key
    WHEN 'buzios_paradise'  THEN 'Passeio de Escuna + Buggy Off-Road + Almoço'
    WHEN 'mar_terra'        THEN 'Passeio de Escuna + Buggy Off-Road'
    WHEN 'buggy_food'       THEN 'Buggy Off-Road + Almoço'
    WHEN 'perfeicao_buzios' THEN 'Passeio de Escuna + Almoço'
    WHEN 'dive_drive'       THEN 'Mergulho + Buggy Off-Road'
    WHEN 'brigitte_bardot'  THEN 'Passeio de Catamarã + Jardineira'
  END,
  descricao_es = CASE key
    WHEN 'buzios_paradise'  THEN 'Paseo en Goleta + Buggy Off-Road + Almuerzo'
    WHEN 'mar_terra'        THEN 'Paseo en Goleta + Buggy Off-Road'
    WHEN 'buggy_food'       THEN 'Buggy Off-Road + Almuerzo'
    WHEN 'perfeicao_buzios' THEN 'Paseo en Goleta + Almuerzo'
    WHEN 'dive_drive'       THEN 'Buceo + Buggy Off-Road'
    WHEN 'brigitte_bardot'  THEN 'Paseo en Catamarán + Jardinera'
  END,
  descricao_en = CASE key
    WHEN 'buzios_paradise'  THEN 'Schooner Tour + Off-Road Buggy + Lunch'
    WHEN 'mar_terra'        THEN 'Schooner Tour + Off-Road Buggy'
    WHEN 'buggy_food'       THEN 'Off-Road Buggy + Lunch'
    WHEN 'perfeicao_buzios' THEN 'Schooner Tour + Lunch'
    WHEN 'dive_drive'       THEN 'Diving + Off-Road Buggy'
    WHEN 'brigitte_bardot'  THEN 'Catamaran Tour + Trolley'
  END,
  descricao_fr = CASE key
    WHEN 'buzios_paradise'  THEN 'Tour en Goélette + Buggy Tout-Terrain + Déjeuner'
    WHEN 'mar_terra'        THEN 'Tour en Goélette + Buggy Tout-Terrain'
    WHEN 'buggy_food'       THEN 'Buggy Tout-Terrain + Déjeuner'
    WHEN 'perfeicao_buzios' THEN 'Tour en Goélette + Déjeuner'
    WHEN 'dive_drive'       THEN 'Plongée + Buggy Tout-Terrain'
    WHEN 'brigitte_bardot'  THEN 'Tour en Catamaran + Petit Train'
  END,
  descricao_it = CASE key
    WHEN 'buzios_paradise'  THEN 'Tour in Goletta + Buggy Off-Road + Pranzo'
    WHEN 'mar_terra'        THEN 'Tour in Goletta + Buggy Off-Road'
    WHEN 'buggy_food'       THEN 'Buggy Off-Road + Pranzo'
    WHEN 'perfeicao_buzios' THEN 'Tour in Goletta + Pranzo'
    WHEN 'dive_drive'       THEN 'Immersione + Buggy Off-Road'
    WHEN 'brigitte_bardot'  THEN 'Tour in Catamarano + Trenino'
  END
WHERE key IN ('buzios_paradise','mar_terra','buggy_food','perfeicao_buzios','dive_drive','brigitte_bardot');
