import frappe


def _site_ok(data):
    return {"success": True, "data": data}


def _site_error(message):
    return {"success": False, "message": message}


def _site_text(value):
    if value is None:
        return ""
    return str(value).strip()


def _site_id(value):
    if value is None:
        return ""
    return str(value)


def _site_optional_text(value):
    text = _site_text(value)
    return text or None


def _site_level1_id(code1):
    return "l1:{0}".format(code1)


def _site_level2_value(code1, subgroup):
    return "{0}.{1}".format(code1, subgroup)


def _site_level2_id(code1, subgroup):
    return "l2:{0}:{1}".format(code1, _site_level2_value(code1, subgroup))


def _site_parse_level1(level1_id=None, code1=None):
    value = _site_text(code1)
    if not value and level1_id:
        parts = _site_text(level1_id).split(":")
        if len(parts) >= 2:
            value = parts[1]
    return value.zfill(2) if value else ""


def _site_parse_level2(category_id=None, level2_code=None):
    value = _site_text(level2_code)
    if not value and category_id:
        parts = _site_text(category_id).split(":")
        if len(parts) >= 3:
            value = parts[2]

    if not value:
        return "", ""

    if "." in value:
        code1, subgroup = value.split(".", 1)
        return code1.zfill(2), subgroup.zfill(2)

    return "", value.zfill(2)


def _site_resolve_code_type(code1):
    try:
        data = _read_code_types() or {}
        mapping = data.get("code_type_by_l1") or {}
        resolved = mapping.get(str(code1).zfill(2))
        if resolved in ("type1", "type2"):
            return resolved
    except Exception:
        pass

    try:
        numeric = int(code1)
    except Exception:
        numeric = 0

    return "type1" if 1 <= numeric <= 10 else "type2"


def _site_decode_text(value):
    if isinstance(value, bytes):
        return decode_blob(value)
    return value


def _site_public_card_exists_sql(card_expr):
    return f"""
        (
            EXISTS (
                SELECT 1
                FROM DOCUMENTS d
                WHERE d.FOR_PUBL = 'T'
                  AND d.MAINCARDID = {card_expr}
            )
            OR EXISTS (
                SELECT 1
                FROM DOCTOCARD dtc
                JOIN DOCUMENTS d ON d.DOCID = dtc.DOCID
                WHERE dtc.CARDID = {card_expr}
                  AND d.FOR_PUBL = 'T'
            )
        )
    """


def _site_card_category_id_from_row(row):
    code1 = _site_text(row.get("CODE1")).zfill(2)
    code2 = _site_text(row.get("CODE2")).zfill(2)
    code3 = _site_text(row.get("CODE3")).zfill(2)
    if not code1 or code1 == "00":
        return None

    code_type = _site_resolve_code_type(code1)
    subgroup = code3 if code_type == "type1" else code2
    if not subgroup or subgroup == "00":
        return None

    return _site_level2_id(code1, subgroup)


def _site_card_summary_from_row(row, category_id):
    card_id = _site_id(row.get("CARDID") or row.get("card_id") or row.get("id"))
    title = _site_text(_site_decode_text(row.get("CARDDESC") or row.get("card_desc") or row.get("title")))
    if not card_id or not title:
        return None

    return {
        "id": card_id,
        "title": title,
        "code": _site_optional_text(row.get("FULLCODE") or row.get("full_code") or row.get("code")),
        "categoryId": category_id,
    }


def _site_document_from_row(row):
    doc_id = _site_id(row.get("DOCID") or row.get("doc_id") or row.get("id"))
    title = _site_text(_site_decode_text(row.get("DOCDESC") or row.get("title")))
    if not doc_id or not title:
        return None

    return {
        "id": doc_id,
        "title": title,
        "downloadUrl": "/api/catalog/documents/{0}/download".format(doc_id),
    }


def _site_relation_from_row(row):
    card_id = _site_id(row.get("ZAMCARDID") or row.get("CARDID") or row.get("card_id") or row.get("id"))
    title = _site_text(_site_decode_text(row.get("CARDDESC") or row.get("title") or row.get("name")))
    if not card_id or not title:
        return None

    available = str(row.get("AVAILABLE", 0)) in ("1", "True", "true")
    relation = {
        "id": card_id,
        "title": title,
        "available": available,
    }
    if not available:
        relation["disabledReason"] = "Недоступно на сайте"
    return relation


@frappe.whitelist()
def get_site_catalog_level1_categories():
    try:
        rows = execute_query(
            f"""
            SELECT DISTINCT
                l1.CODE1,
                l1.CARDDESC
            FROM CARDS l1
            WHERE l1.CODE1 IS NOT NULL
              AND l1.CODE1 <> 0
              AND l1.CODE2 = 0
              AND EXISTS (
                  SELECT 1
                  FROM CARDS c
                  WHERE c.CARDLEVEL = 4
                    AND c.CODE1 = l1.CODE1
                    AND {_site_public_card_exists_sql("c.CARDID")}
              )
            ORDER BY l1.CODE1
            """
        )

        categories = []
        for row in rows or []:
            code1 = _site_text(row.get("CODE1")).zfill(2)
            label = _site_text(_site_decode_text(row.get("CARDDESC")))
            if not code1 or code1 == "00" or not label:
                continue

            categories.append(
                {
                    "id": _site_level1_id(code1),
                    "value": code1,
                    "label": "{0} {1}".format(code1, label).strip(),
                    "level": 1,
                }
            )

        return _site_ok({"categories": categories})
    except Exception as error:
        frappe.log_error("Site catalog level1 error: {0}".format(str(error)))
        return _site_error(str(error))


@frappe.whitelist()
def get_site_catalog_level2_categories(level1_id=None, code1=None):
    try:
        code1 = _site_parse_level1(level1_id=level1_id, code1=code1)
        if not code1:
            return _site_error("level1_id or code1 is required")

        code1_int = int(code1)
        code_type = _site_resolve_code_type(code1)
        subgroup_match = "c4.CODE3 = l2.CODE2" if code_type == "type1" else "c4.CODE2 = l2.CODE2"

        rows = execute_query(
            f"""
            SELECT DISTINCT
                l2.CODE1,
                l2.CODE2,
                l2.FULLCODE,
                l2.CARDDESC
            FROM CARDS l2
            WHERE l2.CARDLEVEL = 2
              AND l2.CODE1 = {code1_int}
              AND l2.CODE2 IS NOT NULL
              AND l2.CODE2 <> 0
              AND EXISTS (
                  SELECT 1
                  FROM CARDS c4
                  WHERE c4.CARDLEVEL = 4
                    AND c4.CODE1 = l2.CODE1
                    AND {subgroup_match}
                    AND {_site_public_card_exists_sql("c4.CARDID")}
              )
            ORDER BY l2.CODE2
            """
        )

        categories = []
        for row in rows or []:
            subgroup = _site_text(row.get("CODE2")).zfill(2)
            label = _site_text(_site_decode_text(row.get("CARDDESC")))
            full_code = _site_optional_text(row.get("FULLCODE")) or _site_level2_value(code1, subgroup)
            if not subgroup or subgroup == "00" or not label:
                continue

            categories.append(
                {
                    "id": _site_level2_id(code1, subgroup),
                    "value": full_code,
                    "label": "{0} {1}".format(full_code, label).strip(),
                    "level": 2,
                    "parentId": _site_level1_id(code1),
                }
            )

        return _site_ok({"categories": categories})
    except Exception as error:
        frappe.log_error("Site catalog level2 error: {0}".format(str(error)))
        return _site_error(str(error))


@frappe.whitelist()
def get_site_catalog_cards(category_id=None, code1=None, level2_code=None):
    try:
        parsed_code1, subgroup = _site_parse_level2(category_id=category_id, level2_code=level2_code)
        code1 = parsed_code1 or _site_parse_level1(code1=code1)

        if not code1 or not subgroup:
            return _site_error("category_id or code1 + level2_code is required")

        code1_int = int(code1)
        subgroup_int = int(subgroup)
        code_type = _site_resolve_code_type(code1)
        subgroup_sql = "c.CODE3 = {0}".format(subgroup_int) if code_type == "type1" else "c.CODE2 = {0}".format(subgroup_int)
        category_id = _site_level2_id(code1, subgroup)

        rows = execute_query(
            f"""
            SELECT
                c.CARDID,
                c.FULLCODE,
                c.CARDDESC,
                c.CODE1,
                c.CODE2,
                c.CODE3,
                c.CODE4
            FROM CARDS c
            WHERE c.CARDLEVEL = 4
              AND c.CODE1 = {code1_int}
              AND {subgroup_sql}
              AND {_site_public_card_exists_sql("c.CARDID")}
            ORDER BY c.FULLCODE
            """
        )

        cards = []
        for row in rows or []:
            item = _site_card_summary_from_row(row, category_id)
            if item:
                cards.append(item)

        return _site_ok({"cards": cards})
    except Exception as error:
        frappe.log_error("Site catalog cards error: {0}".format(str(error)))
        return _site_error(str(error))


@frappe.whitelist()
def get_site_catalog_card(card_id=None):
    try:
        if not card_id:
            return _site_error("card_id is required")

        card_id = int(card_id)

        card_rows = execute_query(
            f"""
            SELECT
                CARDID,
                CODE1,
                CODE2,
                CODE3,
                CODE4,
                CARDDESC,
                CARDCOMMENT,
                FULLCODE
            FROM CARDS
            WHERE CARDID = {card_id}
            """
        )
        if not card_rows:
            return _site_ok({"card": None})

        documents_rows = execute_query(
            f"""
            SELECT DISTINCT
                d.DOCID,
                d.DOCDESC
            FROM DOCUMENTS d
            LEFT JOIN DOCTOCARD dtc ON dtc.DOCID = d.DOCID
            WHERE d.FOR_PUBL = 'T'
              AND (d.MAINCARDID = {card_id} OR dtc.CARDID = {card_id})
            ORDER BY d.DOCID
            """
        )

        documents = []
        for row in documents_rows or []:
            item = _site_document_from_row(row)
            if item:
                documents.append(item)

        if not documents:
            return _site_ok({"card": None})

        zam_parts_rows = execute_query(
            f"""
            SELECT
                z.ZAMCARDID,
                c.CARDDESC,
                c.FULLCODE,
                CASE
                    WHEN {_site_public_card_exists_sql("z.ZAMCARDID")} THEN 1
                    ELSE 0
                END AS AVAILABLE
            FROM ZAMPARTS z
            JOIN CARDS c ON c.CARDID = z.ZAMCARDID
            WHERE z.CARDID = {card_id}
            ORDER BY c.FULLCODE
            """
        )

        zam_parts = []
        for row in zam_parts_rows or []:
            item = _site_relation_from_row(row)
            if item:
                zam_parts.append(item)

        card_row = card_rows[0]
        comment = _site_optional_text(_site_decode_text(card_row.get("CARDCOMMENT")))
        card = {
            "id": _site_id(card_row.get("CARDID")),
            "title": _site_text(_site_decode_text(card_row.get("CARDDESC"))),
            "comment": comment,
            "documents": documents,
            "zamParts": zam_parts,
            "categoryId": _site_card_category_id_from_row(card_row),
            "CODE1": card_row.get("CODE1"),
            "CODE2": card_row.get("CODE2"),
            "CODE3": card_row.get("CODE3"),
        }

        return _site_ok({"card": card})
    except Exception as error:
        frappe.log_error("Site catalog card error: {0}".format(str(error)))
        return _site_error(str(error))


@frappe.whitelist()
def get_site_catalog_card_images(card_id=None):
    try:
        if not card_id:
            return _site_error("card_id is required")

        card_id = int(card_id)
        if not execute_query(
            f"""
            SELECT FIRST 1 c.CARDID
            FROM CARDS c
            WHERE c.CARDID = {card_id}
              AND {_site_public_card_exists_sql("c.CARDID")}
            """
        ):
            return _site_ok({"images": []})

        result = get_card_images(card_id=card_id)
        if isinstance(result, dict) and result.get("success") is False:
            return _site_error(result.get("message") or "Image loading failed")

        payload = result.get("data") if isinstance(result, dict) and "data" in result else result
        images = payload.get("images") if isinstance(payload, dict) else []
        return _site_ok({"images": images or []})
    except Exception as error:
        frappe.log_error("Site catalog card images error: {0}".format(str(error)))
        return _site_error(str(error))


@frappe.whitelist()
def download_site_document_file(doc_id=None):
    try:
        if not doc_id:
            return _site_error("doc_id is required")

        doc_id = int(doc_id)
        rows = execute_query(
            f"""
            SELECT FIRST 1 DOCID
            FROM DOCUMENTS
            WHERE DOCID = {doc_id}
              AND FOR_PUBL = 'T'
            """
        )
        if not rows:
            return _site_error("Document is not public")

        return download_document_file(doc_id=doc_id)
    except Exception as error:
        frappe.log_error("Site document download error: {0}".format(str(error)))
        return _site_error(str(error))
