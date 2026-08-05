# ERP catalog site API v2

Эта версия нужна под новый облегченный каталог сайта и под ускорение загрузки.

Что поменялось:

- первый запрос возвращает только `L1` категории;
- `L2` грузятся отдельным запросом по клику;
- список карточек отдает только `id`, `title`, `code`, `categoryId`;
- детальная карточка отдает только `title`, `comment`, `documents`, `zamParts`;
- изображения карточки приходят отдельным методом;
- изображения не попадают в список документов;
- публичность карточки по-прежнему определяется только наличием хотя бы одного документа с `FOR_PUBL = 'T'`.
- методы теперь опираются на прямые SQL-выборки по `CARDS / DOCUMENTS / DOCTOCARD / ZAMPARTS`, а не на полный `get_card_full_data` для каждой карточки.

Файл с готовыми методами:

- `docs/frappe_catalog_public_methods_v2.py`

Набор методов:

- `get_site_catalog_level1_categories`
- `get_site_catalog_level2_categories`
- `get_site_catalog_cards`
- `get_site_catalog_card`
- `get_site_catalog_card_images`
- `download_site_document_file`

Что нужно сделать на ERP:

1. Открыть модуль `erpnext.manufacturing.page.design_documentation.api`.
2. Вставить методы из `docs/frappe_catalog_public_methods_v2.py`.
   Важно: методы должны быть именно с декоратором `@frappe.whitelist()`.
3. Убедиться, что в этом же модуле уже доступны существующие функции:
   - `get_unique_level1_codes`
   - `get_unique_level2_codes`
   - `get_card_images`
   - `download_document_file`
   - `_read_code_types`
   - `execute_query`
   - `decode_blob`
4. Перезапустить Frappe backend.

Если в вашем ERP какие-то из этих helper-методов лежат не в этом файле, достаточно поправить вызовы или добавить импорт в начале python-файла.
