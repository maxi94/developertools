import {
  DEFAULT_LANGUAGE,
  SECONDARY_FALLBACK_LANGUAGE,
  type AppLanguage,
} from '@/shared/i18n/config'

type ToolRegistryCopy = {
  routeToolSegment: string
  searchInMenu: string
  clearSearch: string
  favorites: string
  favoritesMenu: string
  expandFavorites: string
  collapseFavorites: string
  expandCategory: string
  collapseCategory: string
  menu: string
  noToolsFound: string
  developerHub: string
  developerHubSubtitle: string
  activeTools: string
  categories: string
  whatsNew: string
  hide: string
  noPinnedFavorites: string
  activeCategory: string
  tools: string
  latestUpdate: string
  favorite: string
  pin: string
  open: string
  statusOn: string
  statusSoon: string
  openMenu: string
  closeMenu: string
  goHome: string
  controlCenter: string
  language: string
  theme: string
  themeLight: string
  themeDark: string
  themeSystem: string
  changeThemeMode: string
  navigation: string
  expandMenu: string
  collapseMenu: string
  pinMenu: string
  unpinMenu: string
  home: string
  mainDashboard: string
  statusSummary: string
  selectFromMenu: string
  pinFavorite: string
  removeFavorite: string
  loadingTool: string
}

type ToolCardCopy = {
  addToFavorites: string
  removeFromFavorites: string
}

type ColorToolsCopy = {
  title: string
  description: string
  baseColor: string
  invalidColor: string
  contrastChecker: string
  foreground: string
  background: string
  previewText: string
  ratio: string
  pass: string
  fail: string
  enterValidColors: string
  copyValue: string
  aaNormal: string
  aaaNormal: string
  aaLarge: string
  aaaLarge: string
}

type BoxShadowCopy = {
  title: string
  description: string
  inset: string
  preview: string
  copy: string
}

type SpacingPreviewCopy = {
  title: string
  description: string
  headerBlock: string
  contentBlock: string
  footerBlock: string
  copy: string
}

type ImageToBase64Copy = {
  title: string
  description: string
  imageFiles: string
  dataUrls: string
  copyAll: string
  processError: string
  readFileError: string
}

type SvgOptimizerCopy = {
  title: string
  description: string
  svgInput: string
  result: string
  fewerChars: string
  copyMinified: string
  download: string
  invalidSvg: string
  emptyState: string
  previewAlt: string
}

type Catalog = {
  toolRegistry: ToolRegistryCopy
  toolCard: ToolCardCopy
  colorTools: ColorToolsCopy
  boxShadowGenerator: BoxShadowCopy
  spacingPreview: SpacingPreviewCopy
  imageToBase64: ImageToBase64Copy
  svgOptimizer: SvgOptimizerCopy
}

const catalogByLanguage: Record<AppLanguage, Catalog> = {
  es: {
    toolRegistry: {
      routeToolSegment: 'herramienta',
      searchInMenu: 'Buscar en menu...',
      clearSearch: 'Limpiar busqueda',
      favorites: 'Favoritos',
      favoritesMenu: 'Menu de favoritos',
      expandFavorites: 'Expandir favoritos',
      collapseFavorites: 'Colapsar favoritos',
      expandCategory: 'Expandir categoria',
      collapseCategory: 'Colapsar categoria',
      menu: 'Menu',
      noToolsFound: 'No se encontraron herramientas para:',
      developerHub: 'Centro de herramientas para desarrollo',
      developerHubSubtitle: 'Accesos por categoria, favoritos y utilidades locales en un solo lugar.',
      activeTools: 'tools activas',
      categories: 'categorias',
      whatsNew: 'Novedades',
      hide: 'Ocultar',
      noPinnedFavorites: 'Todavia no tenes favoritos fijados.',
      activeCategory: 'Categoria activa',
      tools: 'tools',
      latestUpdate: 'Novedad reciente:',
      favorite: 'Favorito',
      pin: 'Fijar',
      open: 'Abrir',
      statusOn: 'Lista',
      statusSoon: 'Proxima',
      openMenu: 'Abrir menu',
      closeMenu: 'Cerrar menu',
      goHome: 'Ir a inicio',
      controlCenter: 'Centro de control',
      language: 'Idioma',
      theme: 'Tema',
      themeLight: 'Claro',
      themeDark: 'Oscuro',
      themeSystem: 'Sistema',
      changeThemeMode: 'Cambiar modo de tema',
      navigation: 'Navegacion',
      expandMenu: 'Expandir menu',
      collapseMenu: 'Minimizar menu',
      pinMenu: 'Fijar menu',
      unpinMenu: 'Desfijar menu',
      home: 'Inicio',
      mainDashboard: 'Panel principal',
      statusSummary: 'Resumen de estado, mejoras recientes y acceso por categorias.',
      selectFromMenu: 'Selecciona una herramienta desde el menu lateral.',
      pinFavorite: 'Fijar favorito',
      removeFavorite: 'Quitar favorito',
      loadingTool: 'Cargando herramienta...',
    },
    toolCard: {
      addToFavorites: 'Agregar a favoritos',
      removeFromFavorites: 'Quitar de favoritos',
    },
    colorTools: {
      title: 'Herramientas de color',
      description: 'Conversion HEX/RGB/HSL + validador de contraste WCAG con vista previa.',
      baseColor: 'Color base (HEX/RGB/HSL)',
      invalidColor: 'Color invalido. Usa HEX, RGB o HSL.',
      contrastChecker: 'Validador de contraste (WCAG)',
      foreground: 'Texto',
      background: 'Fondo',
      previewText: 'Texto de prueba para validar legibilidad y contraste.',
      ratio: 'Ratio',
      pass: 'Aprobado',
      fail: 'Fallo',
      enterValidColors: 'Ingresa colores validos para calcular contraste.',
      copyValue: 'Copiar',
      aaNormal: 'AA normal',
      aaaNormal: 'AAA normal',
      aaLarge: 'AA grande',
      aaaLarge: 'AAA grande',
    },
    boxShadowGenerator: {
      title: 'Generador de Box Shadow',
      description: 'Vista previa centrada y amplia para ajustar sombras sin recortes.',
      inset: 'Interna (inset)',
      preview: 'Vista previa sombra',
      copy: 'Copiar',
    },
    spacingPreview: {
      title: 'Preview de Border Radius / Espaciado',
      description: 'Vista previa redisenada: card centrada, bloque estable y lectura visual clara.',
      headerBlock: 'Bloque cabecera',
      contentBlock: 'Este bloque simula contenido de una card y permite validar ritmo vertical.',
      footerBlock: 'Pie/acciones',
      copy: 'Copiar',
    },
    imageToBase64: {
      title: 'Imagen a Base64',
      description: 'Carga una o varias imagenes y obten su Data URL en Base64.',
      imageFiles: 'Archivos imagen',
      dataUrls: 'Data URLs',
      copyAll: 'Copiar todo',
      processError: 'No se pudieron procesar las imagenes.',
      readFileError: 'No se pudo leer el archivo.',
    },
    svgOptimizer: {
      title: 'Optimizador SVG / Preview',
      description: 'Minifica SVG removiendo comentarios y espacios extra, con vista previa en vivo.',
      svgInput: 'Entrada SVG',
      result: 'Resultado',
      fewerChars: 'chars menos',
      copyMinified: 'Copiar minificado',
      download: 'Descargar',
      invalidSvg: 'El contenido no parece un SVG valido.',
      emptyState: 'Pega un SVG para ver vista previa y minificacion.',
      previewAlt: 'Vista previa SVG',
    },
  },
  en: {
    toolRegistry: {
      routeToolSegment: 'tool',
      searchInMenu: 'Search in menu...',
      clearSearch: 'Clear search',
      favorites: 'Favorites',
      favoritesMenu: 'Favorites menu',
      expandFavorites: 'Expand favorites',
      collapseFavorites: 'Collapse favorites',
      expandCategory: 'Expand category',
      collapseCategory: 'Collapse category',
      menu: 'Menu',
      noToolsFound: 'No tools found for:',
      developerHub: 'Developer toolbox hub',
      developerHubSubtitle: 'Category access, favorites and local utilities in one place.',
      activeTools: 'active tools',
      categories: 'categories',
      whatsNew: 'What is new',
      hide: 'Hide',
      noPinnedFavorites: "You don't have pinned favorites yet.",
      activeCategory: 'Active category',
      tools: 'tools',
      latestUpdate: 'Latest update:',
      favorite: 'Favorite',
      pin: 'Pin',
      open: 'Open',
      statusOn: 'On',
      statusSoon: 'Soon',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      goHome: 'Go home',
      controlCenter: 'Control Center',
      language: 'Lang',
      theme: 'Theme',
      themeLight: 'Light',
      themeDark: 'Dark',
      themeSystem: 'System',
      changeThemeMode: 'Change theme mode',
      navigation: 'Navigation',
      expandMenu: 'Expand menu',
      collapseMenu: 'Collapse menu',
      pinMenu: 'Pin menu',
      unpinMenu: 'Unpin menu',
      home: 'Home',
      mainDashboard: 'Main dashboard',
      statusSummary: 'Status summary, latest updates and category-based access.',
      selectFromMenu: 'Select a tool from the side menu.',
      pinFavorite: 'Pin favorite',
      removeFavorite: 'Remove favorite',
      loadingTool: 'Loading tool...',
    },
    toolCard: {
      addToFavorites: 'Add to favorites',
      removeFromFavorites: 'Remove from favorites',
    },
    colorTools: {
      title: 'Color tools',
      description: 'HEX/RGB/HSL conversion + WCAG contrast checker with live preview.',
      baseColor: 'Base color (HEX/RGB/HSL)',
      invalidColor: 'Invalid color. Use HEX, RGB or HSL.',
      contrastChecker: 'Contrast checker (WCAG)',
      foreground: 'Foreground',
      background: 'Background',
      previewText: 'The quick brown fox jumps over the lazy dog.',
      ratio: 'Ratio',
      pass: 'Pass',
      fail: 'Fail',
      enterValidColors: 'Enter valid colors to compute contrast.',
      copyValue: 'Copy',
      aaNormal: 'AA normal',
      aaaNormal: 'AAA normal',
      aaLarge: 'AA large',
      aaaLarge: 'AAA large',
    },
    boxShadowGenerator: {
      title: 'Box Shadow Generator',
      description: 'Centered wide preview to tweak shadows without clipping.',
      inset: 'Inset',
      preview: 'Shadow preview',
      copy: 'Copy',
    },
    spacingPreview: {
      title: 'Border Radius / Spacing Preview',
      description: 'Redesigned preview: centered card, stable layout and clear visual rhythm.',
      headerBlock: 'Header block',
      contentBlock: 'This block simulates card content to validate vertical rhythm.',
      footerBlock: 'Footer/actions',
      copy: 'Copy',
    },
    imageToBase64: {
      title: 'Image to Base64',
      description: 'Upload one or more images and get their Data URL in Base64.',
      imageFiles: 'Image files',
      dataUrls: 'Data URLs',
      copyAll: 'Copy all',
      processError: 'Images could not be processed.',
      readFileError: 'Could not read the file.',
    },
    svgOptimizer: {
      title: 'SVG Optimizer / Preview',
      description: 'Minify SVG by removing comments and extra spaces, with live preview.',
      svgInput: 'SVG input',
      result: 'Result',
      fewerChars: 'fewer chars',
      copyMinified: 'Copy minified',
      download: 'Download',
      invalidSvg: 'The content does not look like a valid SVG.',
      emptyState: 'Paste an SVG to preview and minify.',
      previewAlt: 'SVG preview',
    },
  },
  pt: {
    toolRegistry: {
      routeToolSegment: 'ferramenta',
      searchInMenu: 'Buscar no menu...',
      clearSearch: 'Limpar busca',
      favorites: 'Favoritos',
      favoritesMenu: 'Menu de favoritos',
      expandFavorites: 'Expandir favoritos',
      collapseFavorites: 'Recolher favoritos',
      expandCategory: 'Expandir categoria',
      collapseCategory: 'Recolher categoria',
      menu: 'Menu',
      noToolsFound: 'Nenhuma ferramenta encontrada para:',
      developerHub: 'Centro de ferramentas para desenvolvimento',
      developerHubSubtitle: 'Acesso por categoria, favoritos e utilitarios locais em um so lugar.',
      activeTools: 'ferramentas ativas',
      categories: 'categorias',
      whatsNew: 'Novidades',
      hide: 'Ocultar',
      noPinnedFavorites: 'Voce ainda nao tem favoritos fixados.',
      activeCategory: 'Categoria ativa',
      tools: 'ferramentas',
      latestUpdate: 'Atualizacao recente:',
      favorite: 'Favorito',
      pin: 'Fixar',
      open: 'Abrir',
      statusOn: 'Pronta',
      statusSoon: 'Em breve',
      openMenu: 'Abrir menu',
      closeMenu: 'Fechar menu',
      goHome: 'Ir para inicio',
      controlCenter: 'Centro de controle',
      language: 'Idioma',
      theme: 'Tema',
      themeLight: 'Claro',
      themeDark: 'Escuro',
      themeSystem: 'Sistema',
      changeThemeMode: 'Alterar modo de tema',
      navigation: 'Navegacao',
      expandMenu: 'Expandir menu',
      collapseMenu: 'Recolher menu',
      pinMenu: 'Fixar menu',
      unpinMenu: 'Desfixar menu',
      home: 'Inicio',
      mainDashboard: 'Painel principal',
      statusSummary: 'Resumo de status, ultimas melhorias e acesso por categorias.',
      selectFromMenu: 'Selecione uma ferramenta no menu lateral.',
      pinFavorite: 'Fixar favorito',
      removeFavorite: 'Remover favorito',
      loadingTool: 'Carregando ferramenta...',
    },
    toolCard: {
      addToFavorites: 'Adicionar aos favoritos',
      removeFromFavorites: 'Remover dos favoritos',
    },
    colorTools: {
      title: 'Ferramentas de cor',
      description: 'Conversao HEX/RGB/HSL + verificador de contraste WCAG com visualizacao.',
      baseColor: 'Cor base (HEX/RGB/HSL)',
      invalidColor: 'Cor invalida. Use HEX, RGB ou HSL.',
      contrastChecker: 'Verificador de contraste (WCAG)',
      foreground: 'Texto',
      background: 'Fundo',
      previewText: 'Texto de exemplo para validar legibilidade e contraste.',
      ratio: 'Relacao',
      pass: 'Aprovado',
      fail: 'Falha',
      enterValidColors: 'Informe cores validas para calcular o contraste.',
      copyValue: 'Copiar',
      aaNormal: 'AA normal',
      aaaNormal: 'AAA normal',
      aaLarge: 'AA grande',
      aaaLarge: 'AAA grande',
    },
    boxShadowGenerator: {
      title: 'Gerador de Box Shadow',
      description: 'Visualizacao ampla e centralizada para ajustar sombras sem cortes.',
      inset: 'Interna (inset)',
      preview: 'Visualizacao da sombra',
      copy: 'Copiar',
    },
    spacingPreview: {
      title: 'Preview de Border Radius / Espacamento',
      description: 'Preview redesenhada: card centralizado, bloco estavel e leitura visual clara.',
      headerBlock: 'Bloco de cabecalho',
      contentBlock: 'Este bloco simula conteudo de um card para validar ritmo vertical.',
      footerBlock: 'Rodape/acoes',
      copy: 'Copiar',
    },
    imageToBase64: {
      title: 'Imagem para Base64',
      description: 'Envie uma ou mais imagens e obtenha seus Data URLs em Base64.',
      imageFiles: 'Arquivos de imagem',
      dataUrls: 'Data URLs',
      copyAll: 'Copiar tudo',
      processError: 'Nao foi possivel processar as imagens.',
      readFileError: 'Nao foi possivel ler o arquivo.',
    },
    svgOptimizer: {
      title: 'Otimizador SVG / Preview',
      description: 'Minifique SVG removendo comentarios e espacos extras, com visualizacao ao vivo.',
      svgInput: 'Entrada SVG',
      result: 'Resultado',
      fewerChars: 'caracteres a menos',
      copyMinified: 'Copiar minificado',
      download: 'Baixar',
      invalidSvg: 'O conteudo nao parece ser um SVG valido.',
      emptyState: 'Cole um SVG para visualizar e minificar.',
      previewAlt: 'Visualizacao SVG',
    },
  },
}

export function getI18nCopy<Key extends keyof Catalog>(
  language: AppLanguage,
  key: Key,
): Catalog[Key] {
  return (
    catalogByLanguage[language]?.[key]
    ?? catalogByLanguage[SECONDARY_FALLBACK_LANGUAGE]?.[key]
    ?? catalogByLanguage[DEFAULT_LANGUAGE][key]
  )
}
