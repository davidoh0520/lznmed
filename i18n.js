(() => {
  'use strict';

  const STORAGE_KEY = 'lzn-language';
  const DEFAULT_LANGUAGE = 'en';
  const PRICE_NOTICE = 'FOB China. Prices are in USD. Taxes, duties, shipping and other import costs are not included.';
  const PRICE_COMPACT = 'FOB China · USD · Taxes, duties & shipping excluded';
  const LANGUAGE_ORDER = ['en', 'ko', 'zh', 'vi', 'es', 'ru', 'ar', 'fr'];
  const LANGUAGES = {
    en: { label: 'English', html: 'en', dir: 'ltr' },
    ko: { label: '한국어', html: 'ko', dir: 'ltr' },
    zh: { label: '中文', html: 'zh-CN', dir: 'ltr' },
    vi: { label: 'Tiếng Việt', html: 'vi', dir: 'ltr' },
    es: { label: 'Español', html: 'es', dir: 'ltr' },
    ru: { label: 'Русский', html: 'ru', dir: 'ltr' },
    ar: { label: 'العربية', html: 'ar', dir: 'rtl' },
    fr: { label: 'Français', html: 'fr', dir: 'ltr' }
  };

  // English, Korean, Simplified Chinese, Vietnamese, Spanish, Russian, Arabic, French.
  // Rows are also used as an ordered optical-industry glossary for dynamic catalog text.
  const rows = [
    ['Language', '언어', '语言', 'Ngôn ngữ', 'Idioma', 'Язык', 'اللغة', 'Langue'],
    ['All Products', '전체 제품', '全部产品', 'Tất cả sản phẩm', 'Todos los productos', 'Все товары', 'جميع المنتجات', 'Tous les produits'],
    ['Devices', '검안 장비', '验光设备', 'Thiết bị', 'Equipos', 'Оборудование', 'الأجهزة', 'Appareils'],
    ['Tools', '광학 공구', '光学工具', 'Dụng cụ', 'Herramientas', 'Инструменты', 'الأدوات', 'Outils'],
    ['Lenses', '렌즈', '镜片', 'Tròng kính', 'Lentes', 'Линзы', 'العدسات', 'Verres'],
    ['Lens', '렌즈', '镜片', 'Tròng kính', 'Lente', 'Линза', 'عدسة', 'Verre'],
    ['Frames', '안경테', '镜架', 'Gọng kính', 'Monturas', 'Оправы', 'الإطارات', 'Montures'],
    ['Frame', '안경테', '镜架', 'Gọng kính', 'Montura', 'Оправа', 'إطار', 'Monture'],
    ['Categories', '카테고리', '产品分类', 'Danh mục', 'Categorías', 'Категории', 'الفئات', 'Catégories'],
    ['Category', '카테고리', '分类', 'Danh mục', 'Categoría', 'Категория', 'الفئة', 'Catégorie'],
    ['Contact', '문의', '联系我们', 'Liên hệ', 'Contacto', 'Контакты', 'اتصل بنا', 'Contact'],
    ['Sign in', '로그인', '登录', 'Đăng nhập', 'Iniciar sesión', 'Войти', 'تسجيل الدخول', 'Se connecter'],
    ['Create account', '계정 만들기', '创建账户', 'Tạo tài khoản', 'Crear una cuenta', 'Создать аккаунт', 'إنشاء حساب', 'Créer un compte'],
    ['Sign in / Create account', '로그인 / 계정 만들기', '登录 / 创建账户', 'Đăng nhập / Tạo tài khoản', 'Iniciar sesión / Crear una cuenta', 'Войти / Создать аккаунт', 'تسجيل الدخول / إنشاء حساب', 'Se connecter / Créer un compte'],
    ['Account', '계정', '账户', 'Tài khoản', 'Cuenta', 'Аккаунт', 'الحساب', 'Compte'],
    ['Account & Shipping', '계정 및 배송 정보', '账户与配送信息', 'Tài khoản & Giao hàng', 'Cuenta y envío', 'Аккаунт и доставка', 'الحساب والشحن', 'Compte et livraison'],
    ['Edit Account & Shipping', '계정 및 배송 정보 수정', '编辑账户与配送信息', 'Sửa tài khoản & giao hàng', 'Editar cuenta y envío', 'Изменить аккаунт и доставку', 'تعديل الحساب والشحن', 'Modifier le compte et la livraison'],
    ['Cart', '장바구니', '购物车', 'Giỏ hàng', 'Carrito', 'Корзина', 'السلة', 'Panier'],
    ['Shopping cart', '장바구니', '购物车', 'Giỏ hàng', 'Carrito', 'Корзина', 'سلة التسوق', 'Panier'],
    ['Open shopping cart', '장바구니 열기', '打开购物车', 'Mở giỏ hàng', 'Abrir el carrito', 'Открыть корзину', 'فتح سلة التسوق', 'Ouvrir le panier'],
    ['LZN product departments', 'LZN 제품 분야', 'LZN 产品部门', 'Các ngành hàng LZN', 'Departamentos de productos LZN', 'Разделы продукции LZN', 'أقسام منتجات LZN', 'Départements produits LZN'],
    ['Account and cart', '계정 및 장바구니', '账户与购物车', 'Tài khoản và giỏ hàng', 'Cuenta y carrito', 'Аккаунт и корзина', 'الحساب والسلة', 'Compte et panier'],
    ['Sign in or create an account', '로그인 또는 계정 만들기', '登录或创建账户', 'Đăng nhập hoặc tạo tài khoản', 'Iniciar sesión o crear una cuenta', 'Войти или создать аккаунт', 'تسجيل الدخول أو إنشاء حساب', 'Se connecter ou créer un compte'],
    ['All Optical Products', '전체 광학 제품', '全部光学产品', 'Tất cả sản phẩm quang học', 'Todos los productos ópticos', 'Все оптические товары', 'جميع المنتجات البصرية', 'Tous les produits optiques'],
    ['Tools & Equipment', '공구 및 장비', '工具与设备', 'Dụng cụ & thiết bị', 'Herramientas y equipos', 'Инструменты и оборудование', 'الأدوات والمعدات', 'Outils et équipements'],
    ['Close', '닫기', '关闭', 'Đóng', 'Cerrar', 'Закрыть', 'إغلاق', 'Fermer'],
    ['Back to products', '제품 목록으로', '返回产品列表', 'Quay lại sản phẩm', 'Volver a productos', 'Назад к товарам', 'العودة إلى المنتجات', 'Retour aux produits'],
    ['Back to top', '맨 위로', '返回顶部', 'Lên đầu trang', 'Volver arriba', 'Наверх', 'العودة إلى الأعلى', 'Retour en haut'],
    ['View details', '상세 보기', '查看详情', 'Xem chi tiết', 'Ver detalles', 'Подробнее', 'عرض التفاصيل', 'Voir les détails'],
    ['View collection', '컬렉션 보기', '查看系列', 'Xem bộ sưu tập', 'Ver colección', 'Смотреть коллекцию', 'عرض المجموعة', 'Voir la collection'],
    ['View all', '전체 보기', '查看全部', 'Xem tất cả', 'Ver todo', 'Смотреть все', 'عرض الكل', 'Tout voir'],
    ['Explore Products', '제품 살펴보기', '浏览产品', 'Khám phá sản phẩm', 'Explorar productos', 'Смотреть товары', 'استكشف المنتجات', 'Découvrir les produits'],
    ['Browse Categories', '카테고리 보기', '浏览分类', 'Xem danh mục', 'Ver categorías', 'Смотреть категории', 'تصفح الفئات', 'Parcourir les catégories'],
    ['Search Model', '모델 검색', '搜索型号', 'Tìm mẫu', 'Buscar modelo', 'Поиск модели', 'البحث عن الموديل', 'Rechercher un modèle'],
    ['Series', '시리즈', '系列', 'Dòng sản phẩm', 'Serie', 'Серия', 'السلسلة', 'Série'],
    ['All', '전체', '全部', 'Tất cả', 'Todos', 'Все', 'الكل', 'Tous'],
    ['Adult', '성인용', '成人', 'Người lớn', 'Adulto', 'Для взрослых', 'للبالغين', 'Adulte'],
    ['Kids', '아동용', '儿童', 'Trẻ em', 'Niños', 'Для детей', 'للأطفال', 'Enfant'],
    ['Color options', '색상 옵션', '颜色选项', 'Tùy chọn màu', 'Opciones de color', 'Варианты цвета', 'خيارات اللون', 'Options de couleur'],
    ['Choose color', '색상 선택', '选择颜色', 'Chọn màu', 'Elegir color', 'Выбрать цвет', 'اختر اللون', 'Choisir la couleur'],
    ['Choose a color', '색상을 선택하세요', '请选择颜色', 'Chọn một màu', 'Elige un color', 'Выберите цвет', 'اختر لونًا', 'Choisissez une couleur'],
    ['Choose options', '옵션 선택', '选择选项', 'Chọn tùy chọn', 'Elegir opciones', 'Выбрать опции', 'اختر الخيارات', 'Choisir les options'],
    ['Choose an option', '옵션을 선택하세요', '请选择选项', 'Chọn một tùy chọn', 'Elige una opción', 'Выберите опцию', 'اختر خيارًا', 'Choisissez une option'],
    ['Available options', '선택 가능한 옵션', '可选配置', 'Các tùy chọn hiện có', 'Opciones disponibles', 'Доступные опции', 'الخيارات المتاحة', 'Options disponibles'],
    ['Configuration', '구성', '配置', 'Cấu hình', 'Configuración', 'Конфигурация', 'التكوين', 'Configuration'],
    ['Quantity', '수량', '数量', 'Số lượng', 'Cantidad', 'Количество', 'الكمية', 'Quantité'],
    ['Qty', '수량', '数量', 'SL', 'Cant.', 'Кол-во', 'الكمية', 'Qté'],
    ['Add to cart', '장바구니에 담기', '加入购物车', 'Thêm vào giỏ hàng', 'Añadir al carrito', 'Добавить в корзину', 'أضف إلى السلة', 'Ajouter au panier'],
    ['Added', '담았습니다', '已加入', 'Đã thêm', 'Añadido', 'Добавлено', 'تمت الإضافة', 'Ajouté'],
    ['Remove item', '제품 삭제', '移除商品', 'Xóa sản phẩm', 'Eliminar artículo', 'Удалить товар', 'إزالة المنتج', 'Retirer l’article'],
    ['Continue Shopping', '쇼핑 계속하기', '继续选购', 'Tiếp tục mua hàng', 'Seguir comprando', 'Продолжить покупки', 'متابعة التسوق', 'Continuer les achats'],
    ['Proceed to Checkout', '결제 정보 입력', '去结算', 'Tiến hành thanh toán', 'Ir al pago', 'Перейти к оформлению', 'المتابعة للدفع', 'Passer au paiement'],
    ['Your Cart', '장바구니', '您的购物车', 'Giỏ hàng của bạn', 'Tu carrito', 'Ваша корзина', 'سلة مشترياتك', 'Votre panier'],
    ['Your cart is empty', '장바구니가 비어 있습니다', '购物车为空', 'Giỏ hàng đang trống', 'Tu carrito está vacío', 'Корзина пуста', 'سلة التسوق فارغة', 'Votre panier est vide'],
    ['Customer Account', '고객 계정', '客户账户', 'Tài khoản khách hàng', 'Cuenta de cliente', 'Аккаунт клиента', 'حساب العميل', 'Compte client'],
    ['My Orders', '내 주문', '我的订单', 'Đơn hàng của tôi', 'Mis pedidos', 'Мои заказы', 'طلباتي', 'Mes commandes'],
    ['View cart', '장바구니 보기', '查看购物车', 'Xem giỏ hàng', 'Ver carrito', 'Открыть корзину', 'عرض السلة', 'Voir le panier'],
    ['Back to Account', '계정으로 돌아가기', '返回账户', 'Quay lại tài khoản', 'Volver a la cuenta', 'Назад к аккаунту', 'العودة إلى الحساب', 'Retour au compte'],
    ['Checkout', '결제 정보', '结算', 'Thanh toán', 'Pago', 'Оформление заказа', 'الدفع', 'Paiement'],
    ['Payment & Freight', '결제 및 운송', '付款与运费', 'Thanh toán & vận chuyển', 'Pago y transporte', 'Оплата и доставка', 'الدفع والشحن', 'Paiement et transport'],
    ['Loading...', '불러오는 중...', '加载中…', 'Đang tải...', 'Cargando...', 'Загрузка...', 'جارٍ التحميل...', 'Chargement...'],
    ['Subtotal', '소계', '小计', 'Tạm tính', 'Subtotal', 'Промежуточный итог', 'المجموع الفرعي', 'Sous-total'],
    ['Total', '합계', '合计', 'Tổng cộng', 'Total', 'Итого', 'الإجمالي', 'Total'],
    ['Price on request', '가격 문의', '价格请询', 'Liên hệ báo giá', 'Precio bajo consulta', 'Цена по запросу', 'السعر عند الطلب', 'Prix sur demande'],
    ['Price on quotation', '견적 문의', '询价', 'Yêu cầu báo giá', 'Precio según cotización', 'Цена по запросу', 'السعر حسب عرض السعر', 'Prix sur devis'],
    ['Bulk Inquiry', '대량 구매 문의', '批量询价', 'Yêu cầu báo giá số lượng lớn', 'Consulta para pedidos al por mayor', 'Запрос на оптовую поставку', 'استفسار عن الكميات', 'Demande de prix en gros'],
    ['Contact for pricing', '가격은 문의해 주세요', '请联系询价', 'Liên hệ để nhận báo giá', 'Contacte para conocer el precio', 'Уточните цену', 'تواصل معنا لمعرفة السعر', 'Contactez-nous pour le prix'],
    ['From', '최저', '起', 'Từ', 'Desde', 'От', 'ابتداءً من', 'À partir de'],
    ['each', '개당', '每件', 'mỗi chiếc', 'cada uno', 'за единицу', 'للقطعة', 'l’unité'],
    ['per lens', '렌즈 1매당', '每片镜片', 'mỗi tròng kính', 'por lente', 'за линзу', 'لكل عدسة', 'par verre'],
    ['per frame', '안경테 1개당', '每副镜架', 'mỗi gọng', 'por montura', 'за оправу', 'لكل إطار', 'par monture'],
    ['Product Features', '제품 특징', '产品特点', 'Tính năng sản phẩm', 'Características del producto', 'Характеристики товара', 'ميزات المنتج', 'Caractéristiques du produit'],
    ['Specifications', '제품 사양', '产品规格', 'Thông số kỹ thuật', 'Especificaciones', 'Характеристики', 'المواصفات', 'Caractéristiques techniques'],
    ['Description', '제품 설명', '产品说明', 'Mô tả', 'Descripción', 'Описание', 'الوصف', 'Description'],
    ['Products', '제품', '产品', 'Sản phẩm', 'Productos', 'Товары', 'المنتجات', 'Produits'],
    ['Product', '제품', '产品', 'Sản phẩm', 'Producto', 'Товар', 'المنتج', 'Produit'],
    ['Model', '모델', '型号', 'Mẫu', 'Modelo', 'Модель', 'الموديل', 'Modèle'],
    ['Material', '재질', '材质', 'Vật liệu', 'Material', 'Материал', 'المادة', 'Matériau'],
    ['Coating', '코팅', '镀膜', 'Lớp phủ', 'Tratamiento', 'Покрытие', 'الطلاء', 'Traitement'],
    ['Index', '굴절률', '折射率', 'Chiết suất', 'Índice', 'Индекс', 'معامل الانكسار', 'Indice'],
    ['Power', '도수', '度数', 'Độ kính', 'Potencia', 'Оптическая сила', 'القوة', 'Puissance'],
    ['Select power', '도수 선택', '选择度数', 'Chọn độ kính', 'Seleccionar potencia', 'Выберите силу', 'اختر القوة', 'Choisir la puissance'],
    ['Choose power', '도수 선택', '选择度数', 'Chọn độ kính', 'Elegir potencia', 'Выбрать силу', 'اختر القوة', 'Choisir la puissance'],
    ['Single Vision', '단초점', '单光', 'Đơn tròng', 'Monofocal', 'Однофокальные', 'أحادية الرؤية', 'Unifocal'],
    ['Progressive', '누진', '渐进', 'Đa tròng', 'Progresivo', 'Прогрессивные', 'متعددة البؤر', 'Progressif'],
    ['Semi-Finished', '반제품', '半成品', 'Bán thành phẩm', 'Semiterminado', 'Полуфабрикаты', 'نصف مصنعة', 'Semi-fini'],
    ['Optical Lens', '안경 렌즈', '光学镜片', 'Tròng kính quang học', 'Lente óptica', 'Оптическая линза', 'عدسة بصرية', 'Verre optique'],
    ['Optical Lenses', '안경 렌즈', '光学镜片', 'Tròng kính quang học', 'Lentes ópticas', 'Оптические линзы', 'عدسات بصرية', 'Verres optiques'],
    ['Optical Frames', '안경테', '光学镜架', 'Gọng kính quang học', 'Monturas ópticas', 'Оптические оправы', 'إطارات بصرية', 'Montures optiques'],
    ['Optical Tools & Equipment', '광학 공구 및 장비', '光学工具与设备', 'Dụng cụ & thiết bị quang học', 'Herramientas y equipos ópticos', 'Оптические инструменты и оборудование', 'أدوات ومعدات بصرية', 'Outils et équipements optiques'],
    ['Ophthalmic Devices', '안과·검안 장비', '眼科验光设备', 'Thiết bị nhãn khoa', 'Equipos oftálmicos', 'Офтальмологическое оборудование', 'أجهزة طب العيون', 'Appareils ophtalmiques'],
    ['Professional Optical Equipment', '전문 광학 장비', '专业光学设备', 'Thiết bị quang học chuyên nghiệp', 'Equipos ópticos profesionales', 'Профессиональное оптическое оборудование', 'معدات بصرية احترافية', 'Équipement optique professionnel'],
    ['Member access', '회원 전용', '会员访问', 'Quyền truy cập thành viên', 'Acceso para miembros', 'Доступ для участников', 'دخول الأعضاء', 'Accès membre'],
    ['Product prices and purchasing are available to signed-in members.', '제품 가격 확인과 구매는 로그인한 회원만 이용할 수 있습니다.', '登录会员可查看产品价格并购买。', 'Thành viên đã đăng nhập có thể xem giá và mua hàng.', 'Los miembros que hayan iniciado sesión pueden ver los precios y comprar.', 'Цены и покупка доступны вошедшим пользователям.', 'يمكن للأعضاء المسجلين الاطلاع على الأسعار والشراء.', 'Les prix et les achats sont accessibles aux membres connectés.'],
    ['Your account is active. Open Account & Shipping to review or update your saved details.', '계정이 활성화되었습니다. 저장된 정보를 확인하거나 수정하려면 계정 및 배송 정보를 여세요.', '您的账户已启用。请打开“账户与配送信息”查看或更新已保存的信息。', 'Tài khoản của bạn đã hoạt động. Mở Tài khoản & Giao hàng để xem hoặc cập nhật thông tin đã lưu.', 'Tu cuenta está activa. Abre Cuenta y envío para revisar o actualizar tus datos.', 'Ваш аккаунт активен. Откройте раздел аккаунта и доставки, чтобы проверить или обновить данные.', 'حسابك نشط. افتح قسم الحساب والشحن لمراجعة بياناتك المحفوظة أو تحديثها.', 'Votre compte est actif. Ouvrez Compte et livraison pour vérifier ou modifier vos informations.'],
    ['Company name', '회사명', '公司名称', 'Tên công ty', 'Nombre de la empresa', 'Название компании', 'اسم الشركة', 'Nom de l’entreprise'],
    ['Manager / Contact name', '담당자명', '负责人 / 联系人', 'Tên người phụ trách / liên hệ', 'Responsable / Persona de contacto', 'Руководитель / Контактное лицо', 'اسم المدير / جهة الاتصال', 'Responsable / Contact'],
    ['Phone', '전화번호', '电话', 'Điện thoại', 'Teléfono', 'Телефон', 'الهاتف', 'Téléphone'],
    ['Country', '국가', '国家', 'Quốc gia', 'País', 'Страна', 'الدولة', 'Pays'],
    ['Postal code', '우편번호', '邮政编码', 'Mã bưu chính', 'Código postal', 'Почтовый индекс', 'الرمز البريدي', 'Code postal'],
    ['Address line 1', '주소 1', '地址 1', 'Địa chỉ dòng 1', 'Dirección 1', 'Адрес, строка 1', 'العنوان 1', 'Adresse 1'],
    ['Address line 2 (optional)', '주소 2 (선택)', '地址 2（选填）', 'Địa chỉ dòng 2 (không bắt buộc)', 'Dirección 2 (opcional)', 'Адрес, строка 2 (необязательно)', 'العنوان 2 (اختياري)', 'Adresse 2 (facultatif)'],
    ['City', '도시', '城市', 'Thành phố', 'Ciudad', 'Город', 'المدينة', 'Ville'],
    ['State / Province', '주 / 성', '州 / 省', 'Bang / Tỉnh', 'Estado / Provincia', 'Регион / Провинция', 'الولاية / المقاطعة', 'État / Province'],
    ['Preferred courier', '선호 운송사', '首选承运商', 'Đơn vị vận chuyển ưu tiên', 'Transportista preferido', 'Предпочтительный перевозчик', 'شركة الشحن المفضلة', 'Transporteur préféré'],
    ['Other courier name', '기타 운송사명', '其他承运商名称', 'Tên đơn vị vận chuyển khác', 'Otro transportista', 'Другой перевозчик', 'اسم شركة شحن أخرى', 'Autre transporteur'],
    ['Email', '이메일', '电子邮箱', 'Email', 'Correo electrónico', 'Эл. почта', 'البريد الإلكتروني', 'E-mail'],
    ['Terms & Conditions', '이용약관', '条款与条件', 'Điều khoản & Điều kiện', 'Términos y condiciones', 'Условия использования', 'الشروط والأحكام', 'Conditions générales'],
    ['Privacy', '개인정보 보호', '隐私', 'Quyền riêng tư', 'Privacidad', 'Конфиденциальность', 'الخصوصية', 'Confidentialité'],
    ['Shipping', '배송', '配送', 'Giao hàng', 'Envío', 'Доставка', 'الشحن', 'Livraison'],
    ['Returns & Refunds', '반품 및 환불', '退货与退款', 'Đổi trả & Hoàn tiền', 'Devoluciones y reembolsos', 'Возврат и возмещение', 'الإرجاع والاسترداد', 'Retours et remboursements'],
    ['Warranty', '보증', '保修', 'Bảo hành', 'Garantía', 'Гарантия', 'الضمان', 'Garantie'],
    ['Cookies', '쿠키', 'Cookie', 'Cookie', 'Cookies', 'Файлы cookie', 'ملفات تعريف الارتباط', 'Cookies'],
    [PRICE_NOTICE,
      '중국 FOB 조건. 가격은 USD로 표시됩니다. 세금, 관세, 운송비 및 기타 수입 비용은 포함되지 않습니다.',
      '中国离岸价（FOB）。价格以美元（USD）标示，不含税费、关税、运费及其他进口费用。',
      'Điều kiện FOB Trung Quốc. Giá được niêm yết bằng USD, chưa bao gồm thuế, thuế nhập khẩu, phí vận chuyển và các chi phí nhập khẩu khác.',
      'Condiciones FOB China. Los precios se muestran en USD y no incluyen impuestos, aranceles, transporte ni otros gastos de importación.',
      'Условия FOB Китай. Цены указаны в USD и не включают налоги, пошлины, доставку и другие расходы на импорт.',
      'شروط FOB الصين. الأسعار معروضة بالدولار الأمريكي (USD) ولا تشمل الضرائب أو الرسوم الجمركية أو الشحن أو أي تكاليف استيراد أخرى.',
      'Conditions FOB Chine. Les prix sont indiqués en USD et n’incluent pas les taxes, droits de douane, frais de transport ni autres coûts d’importation.'],
    [PRICE_COMPACT,
      '중국 FOB · USD · 세금·관세·운송비 별도',
      '中国 FOB · USD · 不含税费、关税及运费',
      'FOB Trung Quốc · USD · Chưa gồm thuế, thuế nhập khẩu & vận chuyển',
      'FOB China · USD · Impuestos, aranceles y transporte no incluidos',
      'FOB Китай · USD · Без налогов, пошлин и доставки',
      'FOB الصين · USD · لا يشمل الضرائب والرسوم والشحن',
      'FOB Chine · USD · Taxes, droits et transport non inclus'],
    ['FOB China', '중국 FOB', '中国 FOB', 'FOB Trung Quốc', 'FOB China', 'FOB Китай', 'FOB الصين', 'FOB Chine'],
    ['Freight, destination duties and local taxes are not included.', '운송비, 도착지 관세 및 현지 세금은 포함되지 않습니다.', '不含运费、目的地关税及当地税费。', 'Chưa bao gồm phí vận chuyển, thuế nhập khẩu tại điểm đến và thuế địa phương.', 'No se incluyen el transporte, los aranceles de destino ni los impuestos locales.', 'Доставка, пошлины в стране назначения и местные налоги не включены.', 'لا تشمل الأسعار الشحن أو رسوم بلد الوجهة أو الضرائب المحلية.', 'Le transport, les droits à destination et les taxes locales ne sont pas inclus.'],
    ['Representative products', '대표 제품', '代表产品', 'Sản phẩm tiêu biểu', 'Productos representativos', 'Представленные товары', 'منتجات مختارة', 'Produits représentatifs'],
    ['Representative product', '대표 제품', '代表产品', 'Sản phẩm tiêu biểu', 'Producto representativo', 'Представленный товар', 'منتج مختار', 'Produit représentatif'],
    ['Selected portfolio', '주요 제품군', '精选产品组合', 'Danh mục chọn lọc', 'Selección de productos', 'Избранный ассортимент', 'مجموعة مختارة', 'Sélection de produits'],
    ['Browse by category', '카테고리별 보기', '按分类浏览', 'Duyệt theo danh mục', 'Explorar por categoría', 'Поиск по категориям', 'تصفح حسب الفئة', 'Parcourir par catégorie'],
    ['A closer look at the range.', '제품군을 자세히 살펴보세요.', '深入了解产品系列。', 'Khám phá kỹ hơn danh mục sản phẩm.', 'Descubre la gama más de cerca.', 'Познакомьтесь с ассортиментом.', 'نظرة أقرب على المجموعة.', 'Découvrez la gamme en détail.'],
    ['Four product worlds. One smarter destination.', '네 가지 제품 분야를 한곳에서 더 편리하게 만나보세요.', '四大产品领域，一站式高效选购。', 'Bốn nhóm sản phẩm, một điểm đến thông minh hơn.', 'Cuatro líneas de producto, un destino más inteligente.', 'Четыре направления продукции в одном удобном месте.', 'أربعة عوالم من المنتجات في وجهة واحدة أكثر ذكاءً.', 'Quatre univers de produits, une destination plus intelligente.'],
    ['Begin with a category, discover a representative selection, then connect with us for the right product mix.', '카테고리에서 시작해 대표 제품을 살펴보고, 필요한 제품 구성은 당사와 상담하세요.', '从产品分类开始浏览精选产品，并联系我们获取合适的产品组合。', 'Bắt đầu từ một danh mục, khám phá các sản phẩm tiêu biểu rồi liên hệ với chúng tôi để chọn danh mục phù hợp.', 'Empieza por una categoría, descubre una selección representativa y contáctanos para definir la combinación adecuada.', 'Выберите категорию, изучите основные товары и свяжитесь с нами, чтобы подобрать оптимальный ассортимент.', 'ابدأ بفئة، واستكشف مجموعة مختارة، ثم تواصل معنا لاختيار التشكيلة المناسبة.', 'Commencez par une catégorie, découvrez une sélection puis contactez-nous pour composer l’offre adaptée.'],
    ['Professional optical product', '전문 광학 제품', '专业光学产品', 'Sản phẩm quang học chuyên nghiệp', 'Producto óptico profesional', 'Профессиональный оптический товар', 'منتج بصري احترافي', 'Produit optique professionnel'],
    ['Optical Tools & Equipment', '광학 공구 및 장비', '光学工具与设备', 'Dụng cụ & thiết bị quang học', 'Herramientas y equipos ópticos', 'Оптические инструменты и оборудование', 'أدوات ومعدات بصرية', 'Outils et équipements optiques'],
    ['Optical Frame Collection', '안경테 컬렉션', '光学镜架系列', 'Bộ sưu tập gọng kính', 'Colección de monturas ópticas', 'Коллекция оптических оправ', 'مجموعة إطارات بصرية', 'Collection de montures optiques'],
    ['Optical Lens Collection', '안경 렌즈 컬렉션', '光学镜片系列', 'Bộ sưu tập tròng kính', 'Colección de lentes ópticas', 'Коллекция оптических линз', 'مجموعة عدسات بصرية', 'Collection de verres optiques'],
    ['LZN Tools Catalog', 'LZN 공구 카탈로그', 'LZN 工具目录', 'Danh mục dụng cụ LZN', 'Catálogo de herramientas LZN', 'Каталог инструментов LZN', 'كتالوج أدوات LZN', 'Catalogue d’outils LZN'],
    ['LZN Devices Catalog', 'LZN 장비 카탈로그', 'LZN 设备目录', 'Danh mục thiết bị LZN', 'Catálogo de equipos LZN', 'Каталог оборудования LZN', 'كتالوج أجهزة LZN', 'Catalogue d’appareils LZN'],
    ['LZN Lens Catalog', 'LZN 렌즈 카탈로그', 'LZN 镜片目录', 'Danh mục tròng kính LZN', 'Catálogo de lentes LZN', 'Каталог линз LZN', 'كتالوج عدسات LZN', 'Catalogue de verres LZN'],
    ['LZN Eyewear Catalog', 'LZN 안경 카탈로그', 'LZN 眼镜目录', 'Danh mục kính mắt LZN', 'Catálogo de gafas LZN', 'Каталог очков LZN', 'كتالوج نظارات LZN', 'Catalogue de lunettes LZN'],
    ['Motorized Chairs', '전동 검안 의자', '电动验光椅', 'Ghế khám mắt điện', 'Sillas motorizadas', 'Моторизованные кресла', 'كراسي فحص كهربائية', 'Fauteuils motorisés'],
    ['Motorized Examination Chair', '전동 검안 의자', '电动检查椅', 'Ghế khám mắt điện', 'Silla de examen motorizada', 'Моторизованное кресло для осмотра', 'كرسي فحص كهربائي', 'Fauteuil d’examen motorisé'],
    ['Motorized Tables', '전동 검안 테이블', '电动升降台', 'Bàn nâng điện', 'Mesas motorizadas', 'Моторизованные столы', 'طاولات كهربائية', 'Tables motorisées'],
    ['Motorized Instrument Table', '전동 기기 테이블', '电动仪器台', 'Bàn thiết bị điện', 'Mesa motorizada para instrumentos', 'Моторизованный стол для приборов', 'طاولة أجهزة كهربائية', 'Table d’instruments motorisée'],
    ['PD Measurement', '동공거리 측정', '瞳距测量', 'Đo khoảng cách đồng tử', 'Medición de distancia pupilar', 'Измерение межзрачкового расстояния', 'قياس المسافة بين الحدقتين', 'Mesure de l’écart pupillaire'],
    ['Digital PD Meter', '디지털 동공거리계', '数显瞳距仪', 'Máy đo PD kỹ thuật số', 'Pupilómetro digital', 'Цифровой пупиллометр', 'جهاز قياس المسافة بين الحدقتين رقمي', 'Pupillomètre numérique'],
    ['Digital PD & Fitting Meter', '디지털 PD 및 피팅 측정기', '数显瞳距与配镜测量仪', 'Máy đo PD & thông số lắp kính kỹ thuật số', 'Medidor digital de DP y adaptación', 'Цифровой измеритель РЦ и посадки', 'جهاز رقمي لقياس المسافة والملاءمة', 'Mesureur numérique d’écart pupillaire et de centrage'],
    ['PD & Height Gauge', 'PD 및 높이 측정기', '瞳距与高度测量尺', 'Thước đo PD & chiều cao', 'Medidor de DP y altura', 'Измеритель РЦ и высоты', 'مقياس المسافة والارتفاع', 'Jauge d’écart pupillaire et de hauteur'],
    ['Digital PD Ruler', '디지털 PD 자', '数显瞳距尺', 'Thước PD kỹ thuật số', 'Regla digital de DP', 'Цифровая линейка РЦ', 'مسطرة رقمية للمسافة بين الحدقتين', 'Règle numérique d’écart pupillaire'],
    ['Grooving & Beveling', '홈 가공 및 모따기', '开槽与倒边', 'Soi rãnh & vát cạnh', 'Ranurado y biselado', 'Проточка и снятие фаски', 'التخديد والشطف', 'Rainurage et biseautage'],
    ['Pattern & Lens Cutting', '패턴 및 렌즈 절단', '模板与镜片切割', 'Cắt dưỡng & tròng kính', 'Corte de patrones y lentes', 'Резка шаблонов и линз', 'قص القوالب والعدسات', 'Découpe de gabarits et de verres'],
    ['Hand Edgers & Polishers', '수동 옥습기 및 연마기', '手动磨边与抛光设备', 'Máy mài cạnh & đánh bóng thủ công', 'Biseladoras y pulidoras manuales', 'Ручные кромкообрабатывающие и полировальные станки', 'آلات الجلخ والتلميع اليدوية', 'Meuleuses et polisseuses manuelles'],
    ['Drilling & Notching', '드릴링 및 노칭', '钻孔与开槽', 'Khoan & xẻ rãnh', 'Taladrado y muescado', 'Сверление и прорезание пазов', 'الحفر والتخريم', 'Perçage et encochage'],
    ['Centering Equipment', '렌즈 중심 측정 장비', '镜片定中心设备', 'Thiết bị định tâm', 'Equipos de centrado', 'Центровочное оборудование', 'معدات التمركز', 'Équipement de centrage'],
    ['Pattern Drillers', '패턴 드릴', '模板打孔机', 'Máy khoan dưỡng', 'Taladros para patrones', 'Станки для сверления шаблонов', 'مثاقب القوالب', 'Perceuses de gabarits'],
    ['Frame Heaters', '안경테 히터', '镜架加热器', 'Máy gia nhiệt gọng', 'Calentadores de monturas', 'Нагреватели оправ', 'سخانات الإطارات', 'Chauffe-montures'],
    ['Lens Testing Instruments', '렌즈 검사 장비', '镜片检测仪器', 'Thiết bị kiểm tra tròng kính', 'Instrumentos de prueba de lentes', 'Приборы для проверки линз', 'أجهزة فحص العدسات', 'Instruments de contrôle des verres'],
    ['Ultrasonic Cleaners', '초음파 세척기', '超声波清洗机', 'Máy rửa siêu âm', 'Limpiadores ultrasónicos', 'Ультразвуковые очистители', 'أجهزة تنظيف بالموجات فوق الصوتية', 'Nettoyeurs à ultrasons'],
    ['Ultrasonic Cleaner', '초음파 세척기', '超声波清洗机', 'Máy rửa siêu âm', 'Limpiador ultrasónico', 'Ультразвуковой очиститель', 'جهاز تنظيف بالموجات فوق الصوتية', 'Nettoyeur à ultrasons'],
    ['Trial Lens Sets', '시험 렌즈 세트', '试镜片箱', 'Bộ kính thử', 'Cajas de lentes de prueba', 'Наборы пробных линз', 'أطقم عدسات الاختبار', 'Coffrets de verres d’essai'],
    ['Trial Lens Set', '시험 렌즈 세트', '试镜片箱', 'Bộ kính thử', 'Caja de lentes de prueba', 'Набор пробных линз', 'طقم عدسات اختبار', 'Coffret de verres d’essai'],
    ['Trial Frames', '시험테', '试镜架', 'Gọng thử', 'Monturas de prueba', 'Пробные оправы', 'إطارات اختبار', 'Montures d’essai'],
    ['Trial Frame', '시험테', '试镜架', 'Gọng thử', 'Montura de prueba', 'Пробная оправа', 'إطار اختبار', 'Monture d’essai'],
    ['Lensmeters', '렌즈미터', '焦度计', 'Máy đo tròng kính', 'Frontofocómetros', 'Диоптриметры', 'أجهزة قياس العدسات', 'Frontofocomètres'],
    ['Phoropter Arms', '포롭터 암', '综合验光仪支臂', 'Tay đỡ phoropter', 'Brazos para foróptero', 'Кронштейны фороптера', 'أذرع الفوروبتر', 'Bras de phoroptère'],
    ['Dyeing Machines', '렌즈 염색기', '镜片染色机', 'Máy nhuộm tròng kính', 'Máquinas de tintado de lentes', 'Машины для окрашивания линз', 'آلات صبغ العدسات', 'Machines de teinture des verres'],
    ['LED Vision Charts', 'LED 시력표', 'LED 视力表', 'Bảng thị lực LED', 'Optotipos LED', 'Светодиодные таблицы проверки зрения', 'لوحات فحص النظر LED', 'Échelles d’acuité visuelle LED'],
    ['Unit & Refraction Tables', '검안 유닛 및 테이블', '综合验光台与升降台', 'Bàn khám & khúc xạ', 'Unidades y mesas de refracción', 'Рефракционные установки и столы', 'وحدات وطاولات فحص الانكسار', 'Unités et tables de réfraction'],
    ['Clinical & Lens Processing', '임상 장비 및 렌즈 가공', '临床设备与镜片加工', 'Thiết bị lâm sàng & gia công tròng kính', 'Equipos clínicos y procesamiento de lentes', 'Клиническое оборудование и обработка линз', 'المعدات السريرية ومعالجة العدسات', 'Équipement clinique et traitement des verres'],
    ['Vision Test Equipment', '시력 검사 장비', '视力检查设备', 'Thiết bị kiểm tra thị lực', 'Equipos de examen visual', 'Оборудование для проверки зрения', 'معدات فحص النظر', 'Équipement de test visuel'],
    ['Digital Optical Solutions', '디지털 광학 솔루션', '数字光学解决方案', 'Giải pháp quang học kỹ thuật số', 'Soluciones ópticas digitales', 'Цифровые оптические решения', 'حلول بصرية رقمية', 'Solutions optiques numériques'],
    ['Manual Lensmeter', '수동 렌즈미터', '手动焦度计', 'Máy đo tròng kính thủ công', 'Frontofocómetro manual', 'Ручной диоптриметр', 'جهاز قياس عدسات يدوي', 'Frontofocomètre manuel'],
    ['Lens Processing Consumables', '렌즈 가공 소모품', '镜片加工耗材', 'Vật tư tiêu hao gia công tròng kính', 'Consumibles para procesamiento de lentes', 'Расходные материалы для обработки линз', 'مستهلكات معالجة العدسات', 'Consommables de traitement des verres'],
    ['Refraction & Examination Accessories', '굴절검사 및 검안 액세서리', '验光与检查配件', 'Phụ kiện khúc xạ & khám mắt', 'Accesorios de refracción y examen', 'Принадлежности для рефракции и обследования', 'ملحقات الانكسار والفحص', 'Accessoires de réfraction et d’examen'],
    ['Low Vision Aids', '저시력 보조기기', '低视力辅助用品', 'Dụng cụ hỗ trợ thị lực kém', 'Ayudas para baja visión', 'Средства для слабовидящих', 'وسائل مساعدة لضعف البصر', 'Aides basse vision'],
    ['Job Trays', '작업 트레이', '作业托盘', 'Khay công việc', 'Bandejas de trabajo', 'Рабочие лотки', 'صواني العمل', 'Plateaux de travail'],
    ['Nose Pads', '코받침', '鼻托', 'Đệm mũi', 'Plaquetas nasales', 'Носоупоры', 'وسادات الأنف', 'Plaquettes de nez'],
    ['Lens Cleaning Cloths', '렌즈 클리닝 천', '镜片清洁布', 'Khăn lau tròng kính', 'Paños de limpieza de lentes', 'Салфетки для линз', 'أقمشة تنظيف العدسات', 'Chiffons de nettoyage pour verres'],
    ['Tool Sets', '공구 세트', '工具套装', 'Bộ dụng cụ', 'Juegos de herramientas', 'Наборы инструментов', 'أطقم أدوات', 'Jeux d’outils'],
    ['Accessories', '액세서리', '配件', 'Phụ kiện', 'Accesorios', 'Аксессуары', 'الملحقات', 'Accessoires'],
    ['Reading Glasses', '돋보기 안경', '老花镜', 'Kính đọc sách', 'Gafas de lectura', 'Очки для чтения', 'نظارات القراءة', 'Lunettes de lecture'],
    ['Cases', '안경 케이스', '眼镜盒', 'Hộp kính', 'Estuches', 'Футляры', 'علب النظارات', 'Étuis'],
    ['Contact Lens Care & Cases', '콘택트렌즈 관리용품 및 케이스', '隐形眼镜护理用品与盒', 'Chăm sóc & hộp kính áp tròng', 'Cuidado y estuches para lentes de contacto', 'Уход и контейнеры для контактных линз', 'العناية بالعدسات اللاصقة وعلبها', 'Entretien et étuis pour lentilles de contact'],
    ['Display', '진열용품', '展示用品', 'Trưng bày', 'Expositores', 'Витринное оборудование', 'مستلزمات العرض', 'Présentoirs'],
    ['Repair Parts', '수리 부품', '维修配件', 'Linh kiện sửa chữa', 'Piezas de reparación', 'Запасные части', 'قطع الإصلاح', 'Pièces de réparation'],
    ['Vision Training Kits', '시기능 훈련 세트', '视觉训练套装', 'Bộ luyện thị giác', 'Kits de entrenamiento visual', 'Наборы для тренировки зрения', 'أطقم تدريب الرؤية', 'Kits d’entraînement visuel'],
    ['Automatic Beveler', '자동 모따기 기계', '自动倒边机', 'Máy vát cạnh tự động', 'Biseladora automática', 'Автоматический фаскосниматель', 'آلة شطف أوتوماتيكية', 'Biseauteuse automatique'],
    ['Best Choice', '추천 제품', '推荐产品', 'Lựa chọn nổi bật', 'Mejor elección', 'Лучший выбор', 'الخيار الأفضل', 'Meilleur choix'],
    ['Configurable Manual Hand Edger', '주문 구성형 수동 옥습기', '可配置手动磨边机', 'Máy mài cạnh thủ công tùy cấu hình', 'Biseladora manual configurable', 'Настраиваемый ручной кромкообрабатывающий станок', 'آلة جلخ يدوية قابلة للتهيئة', 'Meuleuse manuelle configurable'],
    ['High-speed Polishing Edger', '고속 연마 옥습기', '高速抛光磨边机', 'Máy mài cạnh đánh bóng tốc độ cao', 'Biseladora pulidora de alta velocidad', 'Высокоскоростной кромкообрабатывающий полировальный станок', 'آلة جلخ وتلميع عالية السرعة', 'Meuleuse-polisseuse haute vitesse'],
    ['Manual Lens Edger', '수동 렌즈 옥습기', '手动镜片磨边机', 'Máy mài tròng kính thủ công', 'Biseladora manual de lentes', 'Ручной станок для обработки линз', 'آلة جلخ عدسات يدوية', 'Meuleuse manuelle de verres'],
    ['Hand Edging & Polishing Machine', '수동 옥습·연마기', '手动磨边抛光机', 'Máy mài cạnh & đánh bóng thủ công', 'Biseladora y pulidora manual', 'Ручной станок для обработки кромки и полировки', 'آلة جلخ وتلميع يدوية', 'Meuleuse-polisseuse manuelle'],
    ['Automatic Polisher', '자동 연마기', '自动抛光机', 'Máy đánh bóng tự động', 'Pulidora automática', 'Автоматический полировальный станок', 'آلة تلميع أوتوماتيكية', 'Polisseuse automatique'],
    ['Manual Polisher', '수동 연마기', '手动抛光机', 'Máy đánh bóng thủ công', 'Pulidora manual', 'Ручной полировальный станок', 'آلة تلميع يدوية', 'Polisseuse manuelle'],
    ['Select support structure, wheel width and wheel profile when ordering', '주문 시 지지 구조, 연마 휠 폭 및 휠 형상을 선택하세요', '下单时请选择支撑结构、砂轮宽度和轮型', 'Chọn kết cấu đỡ, chiều rộng và biên dạng đá mài khi đặt hàng', 'Seleccione la estructura de soporte, el ancho y el perfil de la muela al realizar el pedido', 'При заказе выберите опорную конструкцию, ширину и профиль шлифовального круга', 'اختر هيكل الدعم وعرض عجلة الجلخ وشكلها عند الطلب', 'Lors de la commande, choisissez la structure de support, la largeur et le profil de la meule'],
    ['High-speed polishing at 3,600 rpm', '3,600 rpm 고속 연마', '3,600 rpm 高速抛光', 'Đánh bóng tốc độ cao 3.600 vòng/phút', 'Pulido de alta velocidad a 3600 rpm', 'Высокоскоростная полировка — 3600 об/мин', 'تلميع عالي السرعة عند 3,600 دورة/دقيقة', 'Polissage haute vitesse à 3 600 tr/min'],
    ['Integrated work light', '작업등 내장', '内置工作灯', 'Tích hợp đèn làm việc', 'Luz de trabajo integrada', 'Встроенная рабочая подсветка', 'إضاءة عمل مدمجة', 'Éclairage de travail intégré'],
    ['Manual lens edging', '수동 렌즈 옥습', '手动镜片磨边', 'Mài tròng kính thủ công', 'Biselado manual de lentes', 'Ручная обработка кромки линз', 'جلخ العدسات يدويًا', 'Meulage manuel des verres'],
    ['Combined hand edging and polishing', '수동 옥습 및 연마 복합형', '手动磨边与抛光一体机', 'Kết hợp mài cạnh và đánh bóng thủ công', 'Biselado y pulido manual combinados', 'Ручная обработка кромки и полировка', 'جلخ وتلميع يدويان مدمجان', 'Meulage et polissage manuels combinés'],
    ['Automatic polishing', '자동 연마', '自动抛光', 'Đánh bóng tự động', 'Pulido automático', 'Автоматическая полировка', 'تلميع أوتوماتيكي', 'Polissage automatique'],
    ['Bench polishing', '탁상형 연마', '台式抛光', 'Đánh bóng để bàn', 'Pulido de sobremesa', 'Настольная полировка', 'تلميع على الطاولة', 'Polissage sur établi'],
    ['Compact hand edging and polishing equipment for finishing lenses.', '렌즈 마감용 소형 수동 옥습·연마 장비입니다.', '用于镜片精加工的小型手动磨边抛光设备。', 'Thiết bị mài cạnh và đánh bóng thủ công nhỏ gọn để hoàn thiện tròng kính.', 'Equipo compacto de biselado y pulido manual para el acabado de lentes.', 'Компактное ручное оборудование для обработки кромки и финишной полировки линз.', 'معدات يدوية مدمجة لجلخ حواف العدسات وتلميعها النهائي.', 'Équipement manuel compact de meulage et de polissage pour la finition des verres.'],
    ['Counter-mounted and wall-mounted support arms for professional phoropter installations.', '전문 포롭터 설치용 테이블·벽면 장착 지지 암입니다.', '用于专业综合验光仪安装的台面式和壁挂式支撑臂。', 'Tay đỡ gắn bàn và gắn tường cho hệ thống phoropter chuyên nghiệp.', 'Brazos de soporte para instalación en mostrador o pared de forópteros profesionales.', 'Настольные и настенные кронштейны для профессиональной установки фороптера.', 'أذرع دعم مثبتة على الطاولة أو الحائط لتركيب الفوروبتر الاحترافي.', 'Bras de support sur comptoir ou mur pour l’installation professionnelle d’un phoroptère.'],
    ['Multi-pot bench-top dyeing machines for professional optical workshops.', '전문 광학 작업장용 다중 용기 탁상형 렌즈 염색기입니다.', '用于专业光学工作室的多槽台式镜片染色机。', 'Máy nhuộm tròng kính nhiều nồi để bàn cho xưởng quang học chuyên nghiệp.', 'Máquinas de sobremesa con múltiples recipientes para tintar lentes en talleres ópticos profesionales.', 'Настольные многованновые машины для окрашивания линз в профессиональных оптических мастерских.', 'آلات صبغ عدسات مكتبية متعددة الأحواض لورش البصريات الاحترافية.', 'Machines de teinture des verres à plusieurs cuves pour ateliers d’optique professionnels.'],
    ['Illuminated charts and remote-controlled LCD vision testers for professional examination rooms.', '전문 검사실용 조명식 시력표와 원격 제어 LCD 시력 검사기입니다.', '用于专业检查室的照明视力表和遥控 LCD 视力检测仪。', 'Bảng thị lực có đèn và máy kiểm tra thị lực LCD điều khiển từ xa cho phòng khám chuyên nghiệp.', 'Optotipos iluminados y equipos LCD de examen visual con control remoto para salas profesionales.', 'Световые таблицы и ЖК-системы проверки зрения с дистанционным управлением для профессиональных кабинетов.', 'لوحات مضاءة وأجهزة فحص نظر LCD بالتحكم عن بُعد لغرف الفحص الاحترافية.', 'Échelles lumineuses et systèmes LCD télécommandés pour les salles d’examen professionnelles.'],
    ['Ophthalmic unit tables, refraction workstations and edger system tables.', '안과 유닛 테이블, 검안 워크스테이션 및 옥습기 시스템 테이블입니다.', '眼科综合台、验光工作站及磨边系统工作台。', 'Bàn thiết bị nhãn khoa, trạm khúc xạ và bàn hệ thống mài tròng kính.', 'Mesas de unidad oftálmica, estaciones de refracción y mesas para sistemas de biselado.', 'Офтальмологические установки, рефракционные рабочие места и столы для систем обработки линз.', 'طاولات وحدات طب العيون ومحطات فحص الانكسار وطاولات أنظمة جلخ العدسات.', 'Tables d’unités ophtalmiques, postes de réfraction et tables pour systèmes de meulage.'],
    ['Lens processing, lens measurement and clinical diagnostic equipment.', '렌즈 가공·측정 및 임상 진단 장비입니다.', '镜片加工、测量及临床诊断设备。', 'Thiết bị gia công, đo tròng kính và chẩn đoán lâm sàng.', 'Equipos de procesamiento y medición de lentes y de diagnóstico clínico.', 'Оборудование для обработки и измерения линз, а также клинической диагностики.', 'معدات معالجة العدسات وقياسها والتشخيص السريري.', 'Équipement de traitement et de mesure des verres et de diagnostic clinique.'],
    ['Chart projectors, LCD vision charts and digital refraction systems.', '차트 프로젝터, LCD 시력표 및 디지털 굴절검사 시스템입니다.', '视标投影仪、LCD 视力表及数字验光系统。', 'Máy chiếu bảng thị lực, bảng thị lực LCD và hệ thống khúc xạ kỹ thuật số.', 'Proyectores de optotipos, pantallas LCD de agudeza visual y sistemas digitales de refracción.', 'Проекторы знаков, ЖК-таблицы проверки зрения и цифровые рефракционные системы.', 'أجهزة عرض لوحات النظر وشاشات فحص النظر LCD وأنظمة الانكسار الرقمية.', 'Projecteurs d’optotypes, écrans LCD d’acuité visuelle et systèmes numériques de réfraction.'],
    ['Consulting, centering and lens demonstration systems for optical stores.', '안경원용 상담, 중심 측정 및 렌즈 시연 시스템입니다.', '用于眼镜店的咨询、定中心及镜片演示系统。', 'Hệ thống tư vấn, định tâm và trình diễn tròng kính cho cửa hàng quang học.', 'Sistemas de asesoramiento, centrado y demostración de lentes para ópticas.', 'Системы консультирования, центрирования и демонстрации линз для оптических салонов.', 'أنظمة استشارة وتمركز وعرض العدسات لمتاجر البصريات.', 'Systèmes de conseil, de centrage et de démonstration des verres pour magasins d’optique.'],
    ['Patternless Edger', '무패턴 옥습기', '免模板磨边机', 'Máy mài không dưỡng', 'Biseladora sin patrón', 'Бесшаблонный станок', 'آلة جلخ بدون قالب', 'Meuleuse sans gabarit'],
    ['Auto Lens Edger', '자동 렌즈 옥습기', '自动镜片磨边机', 'Máy mài tròng kính tự động', 'Biseladora automática de lentes', 'Автоматический станок для обработки линз', 'آلة جلخ عدسات أوتوماتيكية', 'Meuleuse automatique de verres'],
    ['Lens Groover', '렌즈 홈 가공기', '镜片开槽机', 'Máy soi rãnh tròng kính', 'Ranuradora de lentes', 'Станок для проточки линз', 'آلة تخديد العدسات', 'Rainureuse de verres'],
    ['Lens Drilling Machine', '렌즈 드릴링 머신', '镜片打孔机', 'Máy khoan tròng kính', 'Taladradora de lentes', 'Станок для сверления линз', 'آلة حفر العدسات', 'Perceuse de verres'],
    ['Lens Centering Device', '렌즈 중심 측정기', '镜片定中心仪', 'Thiết bị định tâm tròng kính', 'Centrador de lentes', 'Центратор линз', 'جهاز تمركز العدسات', 'Centreur de verres'],
    ['Lens Stress Tester', '렌즈 응력 검사기', '镜片应力检测仪', 'Máy kiểm tra ứng suất tròng kính', 'Comprobador de tensión de lentes', 'Тестер напряжений линз', 'جهاز فحص إجهاد العدسات', 'Testeur de contraintes des verres'],
    ['Photochromic Lens Tester', '변색 렌즈 검사기', '变色镜片测试仪', 'Máy kiểm tra tròng đổi màu', 'Comprobador de lentes fotocromáticas', 'Тестер фотохромных линз', 'جهاز فحص العدسات المتغيرة اللون', 'Testeur de verres photochromiques'],
    ['Progressive Lens Tester', '누진 렌즈 검사기', '渐进镜片检测仪', 'Máy kiểm tra tròng đa tròng', 'Comprobador de lentes progresivas', 'Тестер прогрессивных линз', 'جهاز فحص العدسات متعددة البؤر', 'Testeur de verres progressifs'],
    ['UV Transmission Tester', 'UV 투과율 검사기', 'UV 透射率测试仪', 'Máy kiểm tra độ truyền UV', 'Medidor de transmisión UV', 'Тестер пропускания УФ', 'جهاز قياس نفاذية الأشعة فوق البنفسجية', 'Testeur de transmission UV'],
    ['Frame Heater', '안경테 히터', '镜架加热器', 'Máy gia nhiệt gọng', 'Calentador de monturas', 'Нагреватель оправ', 'سخان إطارات', 'Chauffe-monture'],
    ['Adjustable Trial Frame', '조절식 시험테', '可调试镜架', 'Gọng thử điều chỉnh', 'Montura de prueba ajustable', 'Регулируемая пробная оправа', 'إطار اختبار قابل للتعديل', 'Monture d’essai réglable'],
    ['Progressive Trial Frame', '누진 시험테', '渐进试镜架', 'Gọng thử đa tròng', 'Montura de prueba progresiva', 'Пробная оправа для прогрессивных линз', 'إطار اختبار للعدسات متعددة البؤر', 'Monture d’essai progressive'],
    ['Blue-light Spectrum Analyzer', '청색광 스펙트럼 분석기', '蓝光光谱分析仪', 'Máy phân tích phổ ánh sáng xanh', 'Analizador de espectro de luz azul', 'Анализатор спектра синего света', 'محلل طيف الضوء الأزرق', 'Analyseur du spectre de lumière bleue'],
    ['Round Occluder Set', '원형 차폐판 세트', '圆形遮眼板套装', 'Bộ che mắt tròn', 'Juego de oclusores redondos', 'Набор круглых окклюдеров', 'طقم حواجب دائرية للعين', 'Jeu d’occludeurs ronds'],
    ['Jackson Cross-Cylinder Lens', '잭슨 크로스 실린더 렌즈', '杰克逊交叉柱镜', 'Kính trụ chéo Jackson', 'Lente de cilindro cruzado Jackson', 'Кросс-цилиндр Джексона', 'عدسة أسطوانية متقاطعة جاكسون', 'Cylindre croisé de Jackson'],
    ['Dual-Light Medical Pupil Pen', '듀얼 라이트 의료용 펜라이트', '双光源医用瞳孔笔', 'Đèn bút khám đồng tử hai chế độ', 'Linterna médica pupilar de doble luz', 'Медицинский фонарик с двумя режимами', 'قلم فحص حدقة طبي ثنائي الإضاءة', 'Stylo médical pupillaire à double éclairage'],
    ['LED Desktop Reading Magnifier', 'LED 탁상용 독서 확대경', 'LED 台式阅读放大镜', 'Kính lúp đọc sách để bàn LED', 'Lupa de lectura de sobremesa LED', 'Настольная LED-лупа для чтения', 'عدسة مكبرة مكتبية LED للقراءة', 'Loupe de lecture de bureau LED'],
    ['Lens-Edger Suction Cups', '옥습기 흡착컵', '磨边机吸盘', 'Cốc hút máy mài tròng', 'Ventosas para biseladora', 'Присоски для станка обработки линз', 'أكواب شفط لآلة جلخ العدسات', 'Ventouses pour meuleuse'],
    ['Lens-Edging Anti-Slip Protection Pads', '렌즈 가공 미끄럼 방지 보호 패드', '镜片磨边防滑保护贴', 'Miếng bảo vệ chống trượt khi mài tròng', 'Almohadillas antideslizantes para biselado', 'Противоскользящие защитные накладки', 'وسادات حماية مانعة للانزلاق أثناء الجلخ', 'Pastilles de protection antidérapantes'],
    ['Clear vision', '선명한 시야', '清晰视野', 'Tầm nhìn rõ', 'Visión nítida', 'Чёткое зрение', 'رؤية واضحة', 'Vision nette'],
    ['UV protection', 'UV 차단', 'UV 防护', 'Chống tia UV', 'Protección UV', 'Защита от УФ', 'حماية من الأشعة فوق البنفسجية', 'Protection UV'],
    ['Blue ray protection', '청색광 차단', '防蓝光', 'Chống ánh sáng xanh', 'Protección contra luz azul', 'Защита от синего света', 'حماية من الضوء الأزرق', 'Protection contre la lumière bleue'],
    ['Photochromic', '변색', '变色', 'Đổi màu', 'Fotocromático', 'Фотохром', 'متغيرة اللون', 'Photochromique'],
    ['High index', '고굴절', '高折射率', 'Chiết suất cao', 'Alto índice', 'Высокий индекс', 'معامل انكسار مرتفع', 'Haut indice'],
    ['Aspheric', '비구면', '非球面', 'Phi cầu', 'Asférico', 'Асферика', 'لا كروية', 'Asphérique'],
    ['Polycarbonate', '폴리카보네이트', '聚碳酸酯', 'Polycarbonate', 'Policarbonato', 'Поликарбонат', 'بولي كربونات', 'Polycarbonate'],
    ['Black', '블랙', '黑色', 'Đen', 'Negro', 'Чёрный', 'أسود', 'Noir'],
    ['White', '화이트', '白色', 'Trắng', 'Blanco', 'Белый', 'أبيض', 'Blanc'],
    ['Blue', '블루', '蓝色', 'Xanh dương', 'Azul', 'Синий', 'أزرق', 'Bleu'],
    ['Green', '그린', '绿色', 'Xanh lá', 'Verde', 'Зелёный', 'أخضر', 'Vert'],
    ['Red', '레드', '红色', 'Đỏ', 'Rojo', 'Красный', 'أحمر', 'Rouge'],
    ['Yellow', '옐로', '黄色', 'Vàng', 'Amarillo', 'Жёлтый', 'أصفر', 'Jaune'],
    ['Orange', '오렌지', '橙色', 'Cam', 'Naranja', 'Оранжевый', 'برتقالي', 'Orange'],
    ['Purple', '퍼플', '紫色', 'Tím', 'Morado', 'Фиолетовый', 'بنفسجي', 'Violet'],
    ['Pink', '핑크', '粉色', 'Hồng', 'Rosa', 'Розовый', 'وردي', 'Rose'],
    ['Silver', '실버', '银色', 'Bạc', 'Plateado', 'Серебристый', 'فضي', 'Argent'],
    ['Gold', '골드', '金色', 'Vàng kim', 'Dorado', 'Золотистый', 'ذهبي', 'Or'],
    ['Gray', '그레이', '灰色', 'Xám', 'Gris', 'Серый', 'رمادي', 'Gris'],
    ['Clear', '투명', '透明', 'Trong suốt', 'Transparente', 'Прозрачный', 'شفاف', 'Transparent'],
    ['Standard', '표준', '标准', 'Tiêu chuẩn', 'Estándar', 'Стандартный', 'قياسي', 'Standard'],
    ['Option', '옵션', '选项', 'Tùy chọn', 'Opción', 'Опция', 'الخيار', 'Option'],
    ['Set', '세트', '套装', 'Bộ', 'Juego', 'Набор', 'طقم', 'Jeu'],
    ['Piece', '개', '件', 'chiếc', 'pieza', 'шт.', 'قطعة', 'pièce'],
    ['Pieces', '개', '件', 'chiếc', 'piezas', 'шт.', 'قطع', 'pièces'],
    ['Pack', '팩', '包', 'gói', 'paquete', 'упаковка', 'عبوة', 'lot'],
    ['Box', '박스', '盒', 'hộp', 'caja', 'коробка', 'علبة', 'boîte'],
    ['Professional', '전문용', '专业', 'Chuyên nghiệp', 'Profesional', 'Профессиональный', 'احترافي', 'Professionnel'],
    ['Portable', '휴대용', '便携式', 'Di động', 'Portátil', 'Портативный', 'محمول', 'Portable'],
    ['Automatic', '자동', '自动', 'Tự động', 'Automático', 'Автоматический', 'أوتوماتيكي', 'Automatique'],
    ['Manual', '수동', '手动', 'Thủ công', 'Manual', 'Ручной', 'يدوي', 'Manuel'],
    ['Adjustable', '조절식', '可调式', 'Điều chỉnh được', 'Ajustable', 'Регулируемый', 'قابل للتعديل', 'Réglable'],
    ['Rechargeable', '충전식', '充电式', 'Sạc lại được', 'Recargable', 'Перезаряжаемый', 'قابل لإعادة الشحن', 'Rechargeable'],
    ['Replacement', '교체용', '替换用', 'Thay thế', 'De repuesto', 'Сменный', 'بديل', 'De remplacement']
  ];

  const exactMaps = Object.fromEntries(LANGUAGE_ORDER.map(code => [code, new Map()]));
  rows.forEach(row => {
    const key = normalizeKey(row[0]);
    LANGUAGE_ORDER.forEach((code, index) => exactMaps[code].set(key, row[index] || row[0]));
  });

  const glossaryRows = [...rows]
    .filter(row => row[0].length > 2 && !/[.!?]$/.test(row[0]))
    .sort((a, b) => b[0].length - a[0].length)
    .map(row => ({ row, pattern: tokenPattern(row[0]) }));

  const textState = new WeakMap();
  const attributeState = new WeakMap();
  let currentLanguage = preferredLanguage();
  let observer;
  let scheduled = false;
  const pendingRoots = new Set();

  function normalizeKey(value) {
    return String(value || '').replace(/\s+/g, ' ').trim().toLocaleLowerCase('en');
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function tokenPattern(value) {
    const escaped = escapeRegExp(value).replace(/\s+/g, '\\s+');
    return new RegExp(`(^|[\\s([{/:;,.!?&—–-])(${escaped})(?=$|[\\s)\\]}/:;,.!?&—–-])`, 'gi');
  }

  function preferredLanguage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && LANGUAGES[saved]) return saved;
    } catch (_) {}
    const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
    for (const candidate of candidates) {
      const tag = String(candidate || '').toLowerCase();
      if (tag.startsWith('ko')) return 'ko';
      if (tag.startsWith('zh')) return 'zh';
      if (tag.startsWith('vi')) return 'vi';
      if (tag.startsWith('es')) return 'es';
      if (tag.startsWith('ru')) return 'ru';
      if (tag.startsWith('ar')) return 'ar';
      if (tag.startsWith('fr')) return 'fr';
      if (tag.startsWith('en')) return 'en';
    }
    return DEFAULT_LANGUAGE;
  }

  function normalizeUsd(value) {
    return String(value || '')
      .replace(/\bUSD\s*\$\s*/gi, 'USD ')
      .replace(/(?:US)?\$\s*(?=\d)/gi, 'USD ')
      .replace(/\bUSD\s+USD\b/gi, 'USD');
  }

  function translateTemplate(value, code) {
    const pack = {
      ko: {
        intended: ' 모델은 전문 안과 검사, 렌즈 가공 및 광학 작업장에서 사용하도록 설계되었습니다.',
        workshop: ' 모델은 전문 광학 작업장용입니다.',
        retail: ': 전문 안경점의 판매, 수리, 관리 및 고객용으로 적합합니다.',
        package: '포장', grossAbbr: '총중량', models: count => `${count}개 모델`,
        packageSize: '포장 크기', grossWeight: '총중량', packingQuantity: '포장 수량', cartonSize: '박스 크기', cartonWeight: '박스 총중량', confirmed: '확인 필요'
      },
      zh: {
        intended: ' 型号适用于专业眼科检查、镜片加工及光学工作室。',
        workshop: ' 型号适用于专业光学工作室。',
        retail: '适用于专业眼镜零售、维修、护理或顾客使用。',
        package: '包装', grossAbbr: '毛重', models: count => `${count} 个型号`,
        packageSize: '包装尺寸', grossWeight: '毛重', packingQuantity: '装箱数量', cartonSize: '外箱尺寸', cartonWeight: '外箱毛重', confirmed: '待确认'
      },
      vi: {
        intended: ' được thiết kế cho khám mắt chuyên nghiệp, gia công tròng kính và sử dụng tại xưởng quang học.',
        workshop: ' dành cho xưởng quang học chuyên nghiệp.',
        retail: ' phù hợp cho bán lẻ, sửa chữa, chăm sóc quang học chuyên nghiệp hoặc sử dụng bởi khách hàng.',
        package: 'Đóng gói', grossAbbr: 'Trọng lượng cả bì', models: count => `${count} mẫu`,
        packageSize: 'Kích thước đóng gói', grossWeight: 'Trọng lượng cả bì', packingQuantity: 'Số lượng đóng thùng', cartonSize: 'Kích thước thùng', cartonWeight: 'Trọng lượng thùng', confirmed: 'Sẽ xác nhận'
      },
      es: {
        intended: ' está diseñado para el examen óptico profesional, el procesamiento de lentes y el uso en talleres ópticos.',
        workshop: ' está diseñado para talleres ópticos profesionales.',
        retail: ' es adecuado para la venta, reparación y cuidado profesional de productos ópticos o para uso del cliente.',
        package: 'Embalaje', grossAbbr: 'Peso bruto', models: count => `${count} ${count === 1 ? 'modelo' : 'modelos'}`,
        packageSize: 'Tamaño del embalaje', grossWeight: 'Peso bruto', packingQuantity: 'Cantidad por caja', cartonSize: 'Tamaño de la caja', cartonWeight: 'Peso bruto de la caja', confirmed: 'Pendiente de confirmación'
      },
      ru: {
        intended: ' предназначена для профессионального офтальмологического обследования, обработки линз и работы в оптической мастерской.',
        workshop: ' предназначена для профессиональной оптической мастерской.',
        retail: ' предназначен для профессиональной продажи, ремонта и ухода за оптикой, а также для использования клиентами.',
        package: 'Упаковка', grossAbbr: 'Вес брутто', models: count => {
          const mod10 = count % 10;
          const mod100 = count % 100;
          const noun = mod10 === 1 && mod100 !== 11 ? 'модель' : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? 'модели' : 'моделей';
          return `${count} ${noun}`;
        },
        packageSize: 'Размер упаковки', grossWeight: 'Вес брутто', packingQuantity: 'Количество в коробке', cartonSize: 'Размер коробки', cartonWeight: 'Вес коробки брутто', confirmed: 'Уточняется'
      },
      ar: {
        intended: ' مصمم للفحص البصري الاحترافي ومعالجة العدسات والاستخدام في ورش البصريات.',
        workshop: ' مخصص للاستخدام في ورش البصريات الاحترافية.',
        retail: ' مناسب للبيع بالتجزئة والإصلاح والعناية البصرية الاحترافية أو لاستخدام العملاء.',
        package: 'العبوة', grossAbbr: 'الوزن الإجمالي', models: count => `${count} موديل`,
        packageSize: 'حجم العبوة', grossWeight: 'الوزن الإجمالي', packingQuantity: 'كمية التعبئة', cartonSize: 'حجم الكرتون', cartonWeight: 'الوزن الإجمالي للكرتون', confirmed: 'يُحدد لاحقًا'
      },
      fr: {
        intended: ' est conçu pour les examens optiques professionnels, le traitement des verres et l’utilisation en atelier d’optique.',
        workshop: ' est conçu pour les ateliers d’optique professionnels.',
        retail: ' convient à la vente, la réparation et l’entretien optiques professionnels ainsi qu’à l’usage du client.',
        package: 'Emballage', grossAbbr: 'Poids brut', models: count => `${count} ${count === 1 ? 'modèle' : 'modèles'}`,
        packageSize: 'Dimensions de l’emballage', grossWeight: 'Poids brut', packingQuantity: 'Quantité par carton', cartonSize: 'Dimensions du carton', cartonWeight: 'Poids brut du carton', confirmed: 'À confirmer'
      }
    }[code];
    if (!pack) return value;

    let translated = value;
    translated = translated.replace(/^(\d+)\s+models?$/i, (_, count) => pack.models(Number(count)));
    translated = translated.replace(/^(.+?) model ([A-Z0-9][A-Z0-9-]*) is intended for professional optical examination, lens processing or workshop use\./i,
      (_, name, model) => `${translateGlossary(name, code)} ${model}${pack.intended}`);
    translated = translated.replace(/^(.+?) model ([A-Z0-9][A-Z0-9-]*) for professional optical workshop use\./i,
      (_, name, model) => `${translateGlossary(name, code)} ${model}${pack.workshop}`);
    translated = translated.replace(/^(.+?) for professional optical retail, repair, care, or customer use\./i,
      (_, name) => `${translateGlossary(name, code)}${pack.retail}`);
    translated = translated
      .replace(/\bPackage\s+(?=[\dØ])/gi, `${pack.package}: `)
      .replace(/\bG\.W\.\s*/gi, `${pack.grossAbbr}: `)
      .replace(/Package size:/gi, `${pack.packageSize}:`)
      .replace(/Gross weight:/gi, `${pack.grossWeight}:`)
      .replace(/Packing quantity:/gi, `${pack.packingQuantity}:`)
      .replace(/Carton size:/gi, `${pack.cartonSize}:`)
      .replace(/Approx\. carton gross weight:/gi, `${pack.cartonWeight}:`)
      .replace(/To be confirmed/gi, pack.confirmed);
    return translated;
  }

  function translateGlossary(value, code) {
    if (code === 'en') return value;
    let output = value;
    glossaryRows.forEach(({ row, pattern }) => {
      const replacement = row[LANGUAGE_ORDER.indexOf(code)] || row[0];
      output = output.replace(pattern, (_, prefix) => `${prefix}${replacement}`);
    });
    return output;
  }

  function translateCore(value, code = currentLanguage) {
    const normalized = normalizeUsd(value);
    if (code === 'en') return normalized;
    if (/^(?=.*\d)[A-Z0-9]+(?:[-/][A-Z0-9]+)*(?:\s+SERIES)?$/i.test(normalized.trim())) return normalized;
    const exact = exactMaps[code].get(normalizeKey(normalized));
    if (exact) return exact;
    return translateGlossary(translateTemplate(normalized, code), code);
  }

  function translatePreservingSpace(value, code = currentLanguage) {
    const source = String(value || '');
    const leading = source.match(/^\s*/)?.[0] || '';
    const trailing = source.match(/\s*$/)?.[0] || '';
    const core = source.trim();
    return core ? `${leading}${translateCore(core, code)}${trailing}` : source;
  }

  function shouldSkip(node) {
    const parent = node.parentElement;
    return !parent || Boolean(parent.closest('script,style,noscript,code,pre,textarea,[data-lzn-no-translate],.lzn-language-picker'));
  }

  function translateTextNode(node) {
    if (shouldSkip(node) || !node.nodeValue?.trim()) return;
    const previous = textState.get(node);
    let source = previous?.source ?? node.nodeValue;
    if (previous && node.nodeValue !== previous.last) source = node.nodeValue;
    const translated = translatePreservingSpace(source);
    textState.set(node, { source, last: translated });
    if (node.nodeValue !== translated) node.nodeValue = translated;
  }

  function translateAttributes(element) {
    if (!(element instanceof Element) || element.closest('.lzn-language-picker,[data-lzn-no-translate]')) return;
    const names = ['aria-label', 'placeholder', 'title', 'alt'];
    let state = attributeState.get(element);
    if (!state) {
      state = new Map();
      attributeState.set(element, state);
    }
    names.forEach(name => {
      if (!element.hasAttribute(name)) return;
      const value = element.getAttribute(name);
      const previous = state.get(name);
      let source = previous?.source ?? value;
      if (previous && value !== previous.last) source = value;
      const translated = translateCore(source);
      state.set(name, { source, last: translated });
      if (value !== translated) element.setAttribute(name, translated);
    });
  }

  function translateTree(root) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      translateTextNode(root);
      return;
    }
    if (!(root instanceof Element) && root !== document) return;
    if (root instanceof Element) translateAttributes(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      if (node.nodeType === Node.TEXT_NODE) translateTextNode(node);
      else translateAttributes(node);
      node = walker.nextNode();
    }
  }

  function ensureLanguagePicker() {
    const header = document.querySelector('body > header');
    if (!header) return;
    let picker = header.querySelector('.lzn-language-picker');
    const target = header.querySelector('.portfolio-actions') || header.querySelector(':scope > nav:last-of-type') || header;
    if (!picker) {
      picker = document.createElement('div');
      picker.className = 'lzn-language-picker';
      picker.dataset.lznNoTranslate = '1';
      picker.innerHTML = '<label for="lznLanguageSelect">Language</label><select id="lznLanguageSelect" aria-label="Language"></select>';
      const select = picker.querySelector('select');
      LANGUAGE_ORDER.forEach(code => {
        const option = document.createElement('option');
        option.value = code;
        option.lang = LANGUAGES[code].html;
        option.textContent = LANGUAGES[code].label;
        select.appendChild(option);
      });
      select.addEventListener('change', () => setLanguage(select.value, true));
      target.appendChild(picker);
    } else if (picker.parentElement !== target && target.classList.contains('portfolio-actions')) {
      target.appendChild(picker);
    }
    const select = picker.querySelector('select');
    if (select) {
      select.value = currentLanguage;
      select.setAttribute('aria-label', translateCore('Language'));
    }
    const label = picker.querySelector('label');
    if (label) label.textContent = translateCore('Language');
  }

  const primaryPriceSelectors = [
    '.marketplace-price', '.card-price', '.detail-price', '.lzn-commerce-price',
    '.order-price', '.quote-price', '.inquiry-price', '[data-device-detail-price]',
    '#detailPrice', '#frameDetailPrice', '.line-total', '.model-cart-total', '.cart-summary'
  ].join(',');

  function ensurePriceNotes(root = document) {
    const elements = [];
    if (root instanceof Element && root.matches(primaryPriceSelectors)) elements.push(root);
    if (root.querySelectorAll) elements.push(...root.querySelectorAll(primaryPriceSelectors));
    elements.forEach(element => {
      if (element.closest('.lzn-language-picker,select,option') || element.querySelector(':scope > .lzn-price-note')) return;
      const content = normalizeUsd(element.textContent);
      if (!/(?:\bUSD\b|price on|quotation|bulk inquiry|contact for pricing)/i.test(content)) return;
      const note = document.createElement('small');
      note.className = 'lzn-price-note';
      note.dataset.lznSource = PRICE_COMPACT;
      note.textContent = translateCore(PRICE_COMPACT);
      element.appendChild(note);
    });

    const cartContainers = [];
    if (root instanceof Element && root.matches('.cart-list,.model-cart-summary')) cartContainers.push(root);
    if (root.querySelectorAll) cartContainers.push(...root.querySelectorAll('.cart-list,.model-cart-summary'));
    cartContainers.forEach(container => {
      if (!/\bUSD\b|\$\s*\d/.test(container.textContent) || container.parentElement?.querySelector(':scope > .lzn-price-terms')) return;
      const notice = document.createElement('p');
      notice.className = 'lzn-price-terms';
      notice.dataset.lznSource = PRICE_NOTICE;
      notice.textContent = translateCore(PRICE_NOTICE);
      container.insertAdjacentElement('afterend', notice);
    });
  }

  function refreshNotices() {
    document.querySelectorAll('.lzn-price-note,.lzn-price-terms').forEach(note => {
      note.textContent = translateCore(note.dataset.lznSource || PRICE_NOTICE);
    });
  }

  function applyDocumentLanguage() {
    const language = LANGUAGES[currentLanguage];
    document.documentElement.lang = language.html;
    document.documentElement.dir = language.dir;
    document.body?.classList.toggle('lzn-rtl', language.dir === 'rtl');
    if (document.title) {
      const previous = document.documentElement.dataset.lznTitleSource || document.title;
      document.documentElement.dataset.lznTitleSource = previous;
      document.title = translateCore(previous);
    }
  }

  function applyAll() {
    applyDocumentLanguage();
    ensureLanguagePicker();
    translateTree(document.body);
    ensurePriceNotes(document);
    refreshNotices();
    window.dispatchEvent(new CustomEvent('lzn:languagechange', { detail: { language: currentLanguage } }));
  }

  function setLanguage(code, persist = true) {
    if (!LANGUAGES[code]) return;
    currentLanguage = code;
    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, code); } catch (_) {}
    }
    applyAll();
  }

  function queueRoot(root) {
    if (root) pendingRoots.add(root.nodeType === Node.TEXT_NODE ? root.parentElement || root : root);
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      const roots = [...pendingRoots];
      pendingRoots.clear();
      ensureLanguagePicker();
      roots.forEach(item => {
        translateTree(item);
        ensurePriceNotes(item);
      });
      refreshNotices();
    });
  }

  function start() {
    applyAll();
    observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'characterData') queueRoot(mutation.target);
        mutation.addedNodes?.forEach(queueRoot);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  window.LZNI18n = Object.freeze({
    languages: LANGUAGES,
    getLanguage: () => currentLanguage,
    setLanguage,
    t: (value, code = currentLanguage) => translateCore(value, code),
    priceNotice: (code = currentLanguage) => translateCore(PRICE_NOTICE, code)
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
