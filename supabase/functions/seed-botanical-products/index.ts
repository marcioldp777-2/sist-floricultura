import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { tenant_id } = await req.json()

    if (!tenant_id) {
      return new Response(
        JSON.stringify({ error: 'tenant_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 1. Create 2 store locations
    const locations = [
      {
        tenant_id,
        code: 'LOJA-CENTRO',
        name: 'Floricultura Centro',
        type: 'store',
        address_street: 'Rua das Flores',
        address_number: '123',
        address_neighborhood: 'Centro',
        address_city: 'São Paulo',
        address_state: 'SP',
        address_zipcode: '01310-100',
        phone: '(11) 3333-1111',
        is_active: true
      },
      {
        tenant_id,
        code: 'LOJA-JARDINS',
        name: 'Floricultura Jardins',
        type: 'store',
        address_street: 'Alameda Santos',
        address_number: '456',
        address_neighborhood: 'Jardins',
        address_city: 'São Paulo',
        address_state: 'SP',
        address_zipcode: '01419-000',
        phone: '(11) 3333-2222',
        is_active: true
      }
    ]

    const { data: createdLocations, error: locError } = await supabase
      .from('locations')
      .upsert(locations, { onConflict: 'tenant_id,code' })
      .select()

    if (locError) throw locError

    const locationIds = createdLocations?.map(l => l.id) || []

    // 2. Create 5 botanical products
    const botanicalProducts = [
      {
        tenant_id,
        sku: 'ROSA-COL-001',
        name: 'Rosa Colombiana Premium',
        slug: 'rosa-colombiana-premium',
        product_type: 'cut_flower',
        description: 'Rosas colombianas de alta qualidade, conhecidas mundialmente por sua beleza duradoura, caules longos e cores vibrantes. Cultivadas nas montanhas da Colômbia a 2.600m de altitude.',
        short_description: 'Rosas premium importadas da Colômbia com pétalas aveludadas.',
        genus: 'Rosa',
        species: 'Rosa hybrida',
        cultivar: 'Freedom',
        common_names: ['Rosa', 'Rose', 'Rosa de Corte'],
        seasonality: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
        flowering_season: ['set', 'out', 'nov', 'dez', 'jan', 'fev'],
        available_colors: ['Vermelho', 'Rosa', 'Branco', 'Amarelo', 'Laranja', 'Bicolor'],
        height_cm_min: 50,
        height_cm_max: 80,
        stems_per_bunch: 12,
        light_level: 'indirect',
        light_lux_min: 10000,
        light_lux_max: 25000,
        watering_frequency: 'daily',
        humidity_min: 60,
        humidity_max: 80,
        temperature_min: 2,
        temperature_max: 8,
        vase_life_days: 12,
        cut_life_days: 14,
        ethylene_sensitive: true,
        post_harvest_notes: 'Cortar hastes em 45° sob água. Trocar água a cada 2 dias. Manter longe de frutas.',
        toxic_to_pets: false,
        toxic_to_children: false,
        is_allergenic: true,
        allergen_notes: 'Pólen pode causar reações em pessoas sensíveis.',
        origin_country: 'Colômbia',
        origin_region: 'Bogotá - Sabana',
        origin_farm: 'Hacienda La Rosa',
        certifications: ['Rainforest Alliance', 'Florverde', 'GlobalG.A.P.'],
        base_price: 89.90,
        cost_price: 45.00,
        is_active: true,
        is_featured: true,
        meta_title: 'Rosa Colombiana Premium | Flores Frescas',
        meta_description: 'Rosas colombianas premium com 12+ dias de durabilidade. Cores vibrantes e caules longos. Entrega em SP.'
      },
      {
        tenant_id,
        sku: 'ORQUI-PHAL-001',
        name: 'Orquídea Phalaenopsis',
        slug: 'orquidea-phalaenopsis',
        product_type: 'potted_plant',
        description: 'A orquídea mais popular do mundo, conhecida como "orquídea borboleta" por suas flores elegantes. Floração pode durar até 3 meses com cuidados adequados. Ideal para ambientes internos.',
        short_description: 'Orquídea borboleta em vaso decorativo, floração prolongada.',
        genus: 'Phalaenopsis',
        species: 'Phalaenopsis amabilis',
        cultivar: 'Hybrid Mix',
        common_names: ['Orquídea Borboleta', 'Moth Orchid', 'Phalaenopsis'],
        seasonality: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
        flowering_season: ['mar', 'abr', 'mai', 'jun', 'jul', 'ago'],
        available_colors: ['Branco', 'Rosa', 'Roxo', 'Amarelo', 'Rajado'],
        height_cm_min: 40,
        height_cm_max: 70,
        pot_diameter_cm: 12,
        light_level: 'indirect',
        light_lux_min: 10000,
        light_lux_max: 20000,
        watering_frequency: 'weekly',
        humidity_min: 50,
        humidity_max: 70,
        temperature_min: 18,
        temperature_max: 28,
        substrate_type: 'Casca de pinus + carvão vegetal + esfagno',
        fertilization_notes: 'Adubar quinzenalmente com NPK 20-20-20 diluído. Suspender durante floração intensa.',
        pruning_notes: 'Após floração, cortar haste acima do 3º nó. Nova floração pode surgir em 2-3 meses.',
        repotting_frequency: 'A cada 2 anos ou quando raízes transbordam o vaso.',
        ventilation_notes: 'Evitar correntes de ar direto. Ambiente ventilado é benéfico.',
        toxic_to_pets: false,
        toxic_to_children: false,
        is_allergenic: false,
        origin_country: 'Brasil',
        origin_region: 'Holambra - SP',
        origin_farm: 'Orquidário Holandês',
        certifications: ['Veiling Holambra', 'Flor Brasil'],
        base_price: 129.90,
        cost_price: 55.00,
        is_active: true,
        is_featured: true,
        meta_title: 'Orquídea Phalaenopsis | Planta Decorativa',
        meta_description: 'Orquídea Phalaenopsis em vaso. Floração de até 3 meses. Ideal para presentear.'
      },
      {
        tenant_id,
        sku: 'SUCUL-ECHE-001',
        name: 'Suculenta Echeveria',
        slug: 'suculenta-echeveria',
        product_type: 'potted_plant',
        description: 'Suculenta em formato de roseta, extremamente resistente e de baixa manutenção. Perfeita para iniciantes e ambientes com bastante luz. Multiplica-se facilmente por folhas.',
        short_description: 'Suculenta compacta em roseta, ideal para decoração e iniciantes.',
        genus: 'Echeveria',
        species: 'Echeveria elegans',
        cultivar: 'Mexican Snowball',
        common_names: ['Suculenta', 'Rosa de Pedra', 'Echeveria'],
        seasonality: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
        flowering_season: ['ago', 'set', 'out', 'nov'],
        available_colors: ['Verde Acinzentado', 'Rosa', 'Roxo', 'Verde Limão'],
        height_cm_min: 5,
        height_cm_max: 15,
        pot_diameter_cm: 8,
        light_level: 'full_sun',
        light_lux_min: 30000,
        light_lux_max: 80000,
        watering_frequency: 'biweekly',
        humidity_min: 30,
        humidity_max: 50,
        temperature_min: 10,
        temperature_max: 35,
        substrate_type: 'Substrato para cactos e suculentas com areia grossa',
        fertilization_notes: 'Adubar mensalmente na primavera/verão com fertilizante para suculentas diluído.',
        pruning_notes: 'Remover folhas secas da base. Rebrotes podem ser replantados.',
        repotting_frequency: 'Anualmente ou quando muito apertada no vaso.',
        ventilation_notes: 'Ambiente bem ventilado previne fungos. Evitar umidade nas folhas.',
        toxic_to_pets: false,
        toxic_to_children: false,
        is_allergenic: false,
        origin_country: 'Brasil',
        origin_region: 'Holambra - SP',
        origin_farm: 'Fazenda Verde Vida',
        certifications: ['Flor Brasil'],
        base_price: 29.90,
        cost_price: 8.00,
        is_active: true,
        is_featured: false,
        meta_title: 'Suculenta Echeveria | Planta Fácil',
        meta_description: 'Suculenta Echeveria em vaso. Baixa manutenção, perfeita para iniciantes.'
      },
      {
        tenant_id,
        sku: 'GIRA-NAC-001',
        name: 'Girassol Nacional',
        slug: 'girassol-nacional',
        product_type: 'cut_flower',
        description: 'Girassóis cultivados no Brasil, símbolo de alegria e energia positiva. Flores grandes e vistosas que acompanham a luz do sol. Excelente para buquês e arranjos decorativos.',
        short_description: 'Girassóis frescos de cultivo nacional, alegria em cada pétala.',
        genus: 'Helianthus',
        species: 'Helianthus annuus',
        cultivar: 'Sunrich Orange',
        common_names: ['Girassol', 'Sunflower', 'Flor do Sol'],
        seasonality: ['set', 'out', 'nov', 'dez', 'jan', 'fev', 'mar'],
        flowering_season: ['out', 'nov', 'dez', 'jan', 'fev'],
        available_colors: ['Amarelo', 'Laranja', 'Bicolor'],
        height_cm_min: 50,
        height_cm_max: 90,
        stems_per_bunch: 5,
        light_level: 'full_sun',
        light_lux_min: 40000,
        light_lux_max: 100000,
        watering_frequency: 'daily',
        humidity_min: 50,
        humidity_max: 70,
        temperature_min: 5,
        temperature_max: 15,
        vase_life_days: 8,
        cut_life_days: 10,
        ethylene_sensitive: true,
        post_harvest_notes: 'Cortar hastes e colocar em água morna. Remover folhas abaixo da linha d\'água.',
        toxic_to_pets: false,
        toxic_to_children: false,
        is_allergenic: true,
        allergen_notes: 'Pólen abundante pode afetar pessoas alérgicas.',
        origin_country: 'Brasil',
        origin_region: 'Holambra - SP',
        origin_farm: 'Sítio Girassol Dourado',
        certifications: ['Veiling Holambra', 'Flor Brasil'],
        base_price: 59.90,
        cost_price: 22.00,
        is_active: true,
        is_featured: false,
        meta_title: 'Girassol Nacional Fresco | Flores Alegres',
        meta_description: 'Girassóis frescos de cultivo nacional. Flores grandes e duradouras para decoração.'
      },
      {
        tenant_id,
        sku: 'ARRAN-CLASS-001',
        name: 'Arranjo Clássico de Rosas',
        slug: 'arranjo-classico-rosas',
        product_type: 'arrangement',
        description: 'Arranjo sofisticado com rosas selecionadas, folhagens nobres e acabamento premium. Ideal para presentear em ocasiões especiais como aniversários, datas comemorativas e declarações de amor.',
        short_description: 'Arranjo elegante com 12 rosas e folhagens nobres em vaso de vidro.',
        genus: 'Rosa',
        species: 'Rosa hybrida',
        cultivar: 'Mixed Premium',
        common_names: ['Arranjo de Rosas', 'Buquê Arranjado', 'Centro de Mesa'],
        seasonality: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
        flowering_season: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
        available_colors: ['Vermelho Clássico', 'Rosa Romântico', 'Branco Puro', 'Mix Colorido'],
        height_cm_min: 30,
        height_cm_max: 45,
        light_level: 'indirect',
        light_lux_min: 5000,
        light_lux_max: 15000,
        watering_frequency: 'daily',
        humidity_min: 60,
        humidity_max: 80,
        temperature_min: 18,
        temperature_max: 24,
        vase_life_days: 10,
        cut_life_days: 12,
        ethylene_sensitive: true,
        post_harvest_notes: 'Manter água sempre limpa. Adicionar conservante floral incluso. Evitar sol direto.',
        toxic_to_pets: false,
        toxic_to_children: false,
        is_allergenic: true,
        allergen_notes: 'Algumas folhagens podem causar irritação em peles sensíveis.',
        origin_country: 'Colômbia/Brasil',
        origin_region: 'Bogotá / Holambra',
        origin_farm: 'Múltiplas Origens Selecionadas',
        certifications: ['Veiling Holambra', 'Florverde'],
        base_price: 189.90,
        cost_price: 75.00,
        is_active: true,
        is_featured: true,
        meta_title: 'Arranjo de Rosas Premium | Presente Elegante',
        meta_description: 'Arranjo clássico com 12 rosas premium e folhagens. Perfeito para presentear.'
      }
    ]

    const { data: createdProducts, error: prodError } = await supabase
      .from('botanical_products')
      .upsert(botanicalProducts, { onConflict: 'tenant_id,sku' })
      .select()

    if (prodError) throw prodError

    const productIds = createdProducts?.map(p => ({ id: p.id, sku: p.sku, name: p.name })) || []

    // 3. Create product variants
    const productVariants: any[] = []
    
    // Rosa Colombiana variants
    const rosaProduct = productIds.find(p => p.sku === 'ROSA-COL-001')
    if (rosaProduct) {
      const rosaColors = ['Vermelho', 'Rosa', 'Branco', 'Amarelo']
      rosaColors.forEach((color, idx) => {
        productVariants.push({
          tenant_id,
          product_id: rosaProduct.id,
          sku: `ROSA-COL-${color.toUpperCase().substring(0,3)}-12`,
          name: `Rosa Colombiana ${color} - 12 unidades`,
          color,
          size: '12 hastes',
          selling_unit: 'bunch',
          unit_quantity: 12,
          price: 89.90,
          cost_price: 45.00,
          height_cm: 60,
          is_default: idx === 0,
          is_active: true
        })
        productVariants.push({
          tenant_id,
          product_id: rosaProduct.id,
          sku: `ROSA-COL-${color.toUpperCase().substring(0,3)}-24`,
          name: `Rosa Colombiana ${color} - 24 unidades`,
          color,
          size: '24 hastes',
          selling_unit: 'bunch',
          unit_quantity: 24,
          price: 159.90,
          cost_price: 85.00,
          height_cm: 60,
          is_default: false,
          is_active: true
        })
      })
    }

    // Orquídea variants
    const orquideaProduct = productIds.find(p => p.sku === 'ORQUI-PHAL-001')
    if (orquideaProduct) {
      const orquideaColors = ['Branco', 'Rosa', 'Roxo']
      orquideaColors.forEach((color, idx) => {
        productVariants.push({
          tenant_id,
          product_id: orquideaProduct.id,
          sku: `ORQUI-PHAL-${color.toUpperCase().substring(0,3)}-P`,
          name: `Orquídea Phalaenopsis ${color} - Pequena`,
          color,
          size: 'Pequena',
          selling_unit: 'unit',
          unit_quantity: 1,
          price: 89.90,
          cost_price: 35.00,
          pot_diameter_cm: 9,
          height_cm: 40,
          is_default: false,
          is_active: true
        })
        productVariants.push({
          tenant_id,
          product_id: orquideaProduct.id,
          sku: `ORQUI-PHAL-${color.toUpperCase().substring(0,3)}-M`,
          name: `Orquídea Phalaenopsis ${color} - Média`,
          color,
          size: 'Média',
          selling_unit: 'unit',
          unit_quantity: 1,
          price: 129.90,
          cost_price: 55.00,
          pot_diameter_cm: 12,
          height_cm: 55,
          is_default: idx === 0,
          is_active: true
        })
        productVariants.push({
          tenant_id,
          product_id: orquideaProduct.id,
          sku: `ORQUI-PHAL-${color.toUpperCase().substring(0,3)}-G`,
          name: `Orquídea Phalaenopsis ${color} - Grande (2 hastes)`,
          color,
          size: 'Grande',
          selling_unit: 'unit',
          unit_quantity: 1,
          price: 189.90,
          cost_price: 80.00,
          pot_diameter_cm: 15,
          height_cm: 70,
          is_default: false,
          is_active: true
        })
      })
    }

    // Suculenta variants
    const suculentaProduct = productIds.find(p => p.sku === 'SUCUL-ECHE-001')
    if (suculentaProduct) {
      const suculentaColors = ['Verde', 'Rosa', 'Roxo']
      suculentaColors.forEach((color, idx) => {
        productVariants.push({
          tenant_id,
          product_id: suculentaProduct.id,
          sku: `SUCUL-ECHE-${color.toUpperCase().substring(0,3)}-U`,
          name: `Suculenta Echeveria ${color} - Unitária`,
          color,
          size: 'Unitária',
          selling_unit: 'unit',
          unit_quantity: 1,
          price: 29.90,
          cost_price: 8.00,
          pot_diameter_cm: 8,
          height_cm: 10,
          is_default: idx === 0,
          is_active: true
        })
        productVariants.push({
          tenant_id,
          product_id: suculentaProduct.id,
          sku: `SUCUL-ECHE-${color.toUpperCase().substring(0,3)}-KIT3`,
          name: `Kit 3 Suculentas Echeveria ${color}`,
          color,
          size: 'Kit 3',
          selling_unit: 'box',
          unit_quantity: 3,
          price: 69.90,
          cost_price: 20.00,
          pot_diameter_cm: 6,
          height_cm: 8,
          is_default: false,
          is_active: true
        })
      })
    }

    // Girassol variants
    const girassolProduct = productIds.find(p => p.sku === 'GIRA-NAC-001')
    if (girassolProduct) {
      productVariants.push(
        {
          tenant_id,
          product_id: girassolProduct.id,
          sku: 'GIRA-NAC-AMA-5',
          name: 'Girassol Amarelo - 5 hastes',
          color: 'Amarelo',
          size: '5 hastes',
          selling_unit: 'bunch',
          unit_quantity: 5,
          price: 59.90,
          cost_price: 22.00,
          height_cm: 70,
          is_default: true,
          is_active: true
        },
        {
          tenant_id,
          product_id: girassolProduct.id,
          sku: 'GIRA-NAC-AMA-10',
          name: 'Girassol Amarelo - 10 hastes',
          color: 'Amarelo',
          size: '10 hastes',
          selling_unit: 'bunch',
          unit_quantity: 10,
          price: 99.90,
          cost_price: 40.00,
          height_cm: 70,
          is_default: false,
          is_active: true
        },
        {
          tenant_id,
          product_id: girassolProduct.id,
          sku: 'GIRA-NAC-LAR-5',
          name: 'Girassol Laranja - 5 hastes',
          color: 'Laranja',
          size: '5 hastes',
          selling_unit: 'bunch',
          unit_quantity: 5,
          price: 64.90,
          cost_price: 25.00,
          height_cm: 70,
          is_default: false,
          is_active: true
        }
      )
    }

    // Arranjo variants
    const arranjoProduct = productIds.find(p => p.sku === 'ARRAN-CLASS-001')
    if (arranjoProduct) {
      const arranjoColors = ['Vermelho Clássico', 'Rosa Romântico', 'Branco Puro', 'Mix Colorido']
      arranjoColors.forEach((color, idx) => {
        const colorCode = color.split(' ')[0].toUpperCase().substring(0,3)
        productVariants.push({
          tenant_id,
          product_id: arranjoProduct.id,
          sku: `ARRAN-CLASS-${colorCode}-12`,
          name: `Arranjo Clássico ${color} - 12 rosas`,
          color,
          size: '12 rosas',
          selling_unit: 'unit',
          unit_quantity: 1,
          price: 189.90,
          cost_price: 75.00,
          height_cm: 35,
          is_default: idx === 0,
          is_active: true
        })
        productVariants.push({
          tenant_id,
          product_id: arranjoProduct.id,
          sku: `ARRAN-CLASS-${colorCode}-24`,
          name: `Arranjo Premium ${color} - 24 rosas`,
          color,
          size: '24 rosas',
          selling_unit: 'unit',
          unit_quantity: 1,
          price: 329.90,
          cost_price: 140.00,
          height_cm: 45,
          is_default: false,
          is_active: true
        })
      })
    }

    const { data: createdVariants, error: varError } = await supabase
      .from('product_variants')
      .upsert(productVariants, { onConflict: 'tenant_id,sku' })
      .select()

    if (varError) throw varError

    // 4. Create stock lots for both locations
    const stockLots: any[] = []
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

    createdVariants?.forEach((variant, idx) => {
      locationIds.forEach((locationId, locIdx) => {
        const lotNumber = `LOT-${today.toISOString().split('T')[0].replace(/-/g, '')}-${String(idx + 1).padStart(3, '0')}-${locIdx + 1}`
        const initialQty = Math.floor(Math.random() * 50) + 10
        
        stockLots.push({
          tenant_id,
          variant_id: variant.id,
          location_id: locationId,
          lot_number: lotNumber,
          arrival_date: today.toISOString().split('T')[0],
          expiry_date: variant.sku.includes('SUCUL') || variant.sku.includes('ORQUI') 
            ? null 
            : nextMonth.toISOString().split('T')[0],
          best_before_date: variant.sku.includes('SUCUL') || variant.sku.includes('ORQUI') 
            ? null 
            : nextWeek.toISOString().split('T')[0],
          initial_quantity: initialQty,
          available_quantity: initialQty - Math.floor(Math.random() * 5),
          reserved_quantity: Math.floor(Math.random() * 3),
          damaged_quantity: Math.floor(Math.random() * 2),
          purchase_price: variant.cost_price * 0.8,
          storage_temperature: variant.sku.includes('ROSA') || variant.sku.includes('GIRA') ? 4 : null,
          supplier_name: variant.sku.includes('ROSA-COL') 
            ? 'Hacienda La Rosa - Colômbia'
            : 'Veiling Holambra',
          supplier_lot_reference: `SUP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          status: 'available'
        })
      })
    })

    const { error: stockError } = await supabase
      .from('stock_lots')
      .upsert(stockLots, { onConflict: 'tenant_id,lot_number' })

    if (stockError) throw stockError

    // 5. Create QR code campaigns for A/B testing
    const generateShortCode = () => Math.random().toString(36).substring(2, 8).toUpperCase()
    
    const qrCodes: any[] = []
    
    // Indoor campaign - softer CTAs, care-focused
    createdProducts?.forEach(product => {
      qrCodes.push({
        tenant_id,
        product_id: product.id,
        short_code: generateShortCode(),
        campaign_name: 'Indoor - Cuidados em Foco',
        context: 'indoor',
        utm_source: 'qr_indoor',
        utm_medium: 'etiqueta',
        utm_campaign: 'cuidados_2024',
        utm_content: 'versao_a_soft',
        notes: 'Campanha indoor: foco em instruções de cuidados. Etiquetas em produtos na loja.',
        label_format: '50x90mm',
        status: 'active'
      })
    })

    // Outdoor campaign - promotional, purchase-focused
    createdProducts?.forEach(product => {
      qrCodes.push({
        tenant_id,
        product_id: product.id,
        short_code: generateShortCode(),
        campaign_name: 'Outdoor - Promo Verão',
        context: 'outdoor',
        utm_source: 'qr_outdoor',
        utm_medium: 'cartaz',
        utm_campaign: 'verao_2024',
        utm_content: 'versao_b_promo',
        notes: 'Campanha outdoor: foco em vendas. Cartazes e displays em vitrines.',
        label_format: 'A7 (74x105mm)',
        status: 'active'
      })
    })

    const { data: createdQRs, error: qrError } = await supabase
      .from('qr_codes')
      .insert(qrCodes)
      .select()

    if (qrError) throw qrError

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          locations: createdLocations?.length || 0,
          products: createdProducts?.length || 0,
          variants: createdVariants?.length || 0,
          stockLots: stockLots.length,
          qrCodes: createdQRs?.length || 0
        },
        message: 'Dados de exemplo criados com sucesso!'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    console.error('Seed error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
