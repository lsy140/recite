import { app as T, ipcMain as G, BrowserWindow as H } from "electron";
import { fileURLToPath as ie } from "node:url";
import S from "node:path";
import J from "fs";
class c extends Error {
  constructor(e, f, t, ...i) {
    Array.isArray(f) && (f = f.join(" ").trim()), super(f), Error.captureStackTrace !== void 0 && Error.captureStackTrace(this, c), this.code = e;
    for (const s of i)
      for (const o in s) {
        const n = s[o];
        this[o] = Buffer.isBuffer(n) ? n.toString(t.encoding) : n == null ? n : JSON.parse(JSON.stringify(n));
      }
  }
}
const ne = function(r) {
  return typeof r == "object" && r !== null && !Array.isArray(r);
}, W = function(r) {
  const e = [];
  for (let f = 0, t = r.length; f < t; f++) {
    const i = r[f];
    if (i == null || i === !1)
      e[f] = { disabled: !0 };
    else if (typeof i == "string")
      e[f] = { name: i };
    else if (ne(i)) {
      if (typeof i.name != "string")
        throw new c("CSV_OPTION_COLUMNS_MISSING_NAME", [
          "Option columns missing name:",
          `property "name" is required at position ${f}`,
          "when column is an object literal"
        ]);
      e[f] = i;
    } else
      throw new c("CSV_INVALID_COLUMN_DEFINITION", [
        "Invalid column definition:",
        "expect a string or a literal object,",
        `got ${JSON.stringify(i)} at position ${f}`
      ]);
  }
  return e;
};
class z {
  constructor(e = 100) {
    this.size = e, this.length = 0, this.buf = Buffer.allocUnsafe(e);
  }
  prepend(e) {
    if (Buffer.isBuffer(e)) {
      const f = this.length + e.length;
      if (f >= this.size && (this.resize(), f >= this.size))
        throw Error("INVALID_BUFFER_STATE");
      const t = this.buf;
      this.buf = Buffer.allocUnsafe(this.size), e.copy(this.buf, 0), t.copy(this.buf, e.length), this.length += e.length;
    } else {
      const f = this.length++;
      f === this.size && this.resize();
      const t = this.clone();
      this.buf[0] = e, t.copy(this.buf, 1, 0, f);
    }
  }
  append(e) {
    const f = this.length++;
    f === this.size && this.resize(), this.buf[f] = e;
  }
  clone() {
    return Buffer.from(this.buf.slice(0, this.length));
  }
  resize() {
    const e = this.length;
    this.size = this.size * 2;
    const f = Buffer.allocUnsafe(this.size);
    this.buf.copy(f, 0, 0, e), this.buf = f;
  }
  toString(e) {
    return e ? this.buf.slice(0, this.length).toString(e) : Uint8Array.prototype.slice.call(this.buf.slice(0, this.length));
  }
  toJSON() {
    return this.toString("utf8");
  }
  reset() {
    this.length = 0;
  }
}
const re = 12, oe = 13, se = 10, le = 32, fe = 9, ae = function(r) {
  return {
    bomSkipped: !1,
    bufBytesStart: 0,
    castField: r.cast_function,
    commenting: !1,
    // Current error encountered by a record
    error: void 0,
    enabled: r.from_line === 1,
    escaping: !1,
    escapeIsQuote: Buffer.isBuffer(r.escape) && Buffer.isBuffer(r.quote) && Buffer.compare(r.escape, r.quote) === 0,
    // columns can be `false`, `true`, `Array`
    expectedRecordLength: Array.isArray(r.columns) ? r.columns.length : void 0,
    field: new z(20),
    firstLineToHeaders: r.cast_first_line_to_header,
    needMoreDataSize: Math.max(
      // Skip if the remaining buffer smaller than comment
      r.comment !== null ? r.comment.length : 0,
      ...r.delimiter.map((e) => e.length),
      // Skip if the remaining buffer can be escape sequence
      r.quote !== null ? r.quote.length : 0
    ),
    previousBuf: void 0,
    quoting: !1,
    stop: !1,
    rawBuffer: new z(100),
    record: [],
    recordHasError: !1,
    record_length: 0,
    recordDelimiterMaxLength: r.record_delimiter.length === 0 ? 0 : Math.max(...r.record_delimiter.map((e) => e.length)),
    trimChars: [
      Buffer.from(" ", r.encoding)[0],
      Buffer.from("	", r.encoding)[0]
    ],
    wasQuoting: !1,
    wasRowDelimiter: !1,
    timchars: [
      Buffer.from(Buffer.from([oe], "utf8").toString(), r.encoding),
      Buffer.from(Buffer.from([se], "utf8").toString(), r.encoding),
      Buffer.from(Buffer.from([re], "utf8").toString(), r.encoding),
      Buffer.from(Buffer.from([le], "utf8").toString(), r.encoding),
      Buffer.from(Buffer.from([fe], "utf8").toString(), r.encoding)
    ]
  };
}, ue = function(r) {
  return r.replace(/([A-Z])/g, function(e, f) {
    return "_" + f.toLowerCase();
  });
}, U = function(r) {
  const e = {};
  for (const t in r)
    e[ue(t)] = r[t];
  if (e.encoding === void 0 || e.encoding === !0)
    e.encoding = "utf8";
  else if (e.encoding === null || e.encoding === !1)
    e.encoding = null;
  else if (typeof e.encoding != "string" && e.encoding !== null)
    throw new c(
      "CSV_INVALID_OPTION_ENCODING",
      [
        "Invalid option encoding:",
        "encoding must be a string or null to return a buffer,",
        `got ${JSON.stringify(e.encoding)}`
      ],
      e
    );
  if (e.bom === void 0 || e.bom === null || e.bom === !1)
    e.bom = !1;
  else if (e.bom !== !0)
    throw new c(
      "CSV_INVALID_OPTION_BOM",
      [
        "Invalid option bom:",
        "bom must be true,",
        `got ${JSON.stringify(e.bom)}`
      ],
      e
    );
  if (e.cast_function = null, e.cast === void 0 || e.cast === null || e.cast === !1 || e.cast === "")
    e.cast = void 0;
  else if (typeof e.cast == "function")
    e.cast_function = e.cast, e.cast = !0;
  else if (e.cast !== !0)
    throw new c(
      "CSV_INVALID_OPTION_CAST",
      [
        "Invalid option cast:",
        "cast must be true or a function,",
        `got ${JSON.stringify(e.cast)}`
      ],
      e
    );
  if (e.cast_date === void 0 || e.cast_date === null || e.cast_date === !1 || e.cast_date === "")
    e.cast_date = !1;
  else if (e.cast_date === !0)
    e.cast_date = function(t) {
      const i = Date.parse(t);
      return isNaN(i) ? t : new Date(i);
    };
  else if (typeof e.cast_date != "function")
    throw new c(
      "CSV_INVALID_OPTION_CAST_DATE",
      [
        "Invalid option cast_date:",
        "cast_date must be true or a function,",
        `got ${JSON.stringify(e.cast_date)}`
      ],
      e
    );
  if (e.cast_first_line_to_header = void 0, e.columns === !0)
    e.cast_first_line_to_header = void 0;
  else if (typeof e.columns == "function")
    e.cast_first_line_to_header = e.columns, e.columns = !0;
  else if (Array.isArray(e.columns))
    e.columns = W(e.columns);
  else if (e.columns === void 0 || e.columns === null || e.columns === !1)
    e.columns = !1;
  else
    throw new c(
      "CSV_INVALID_OPTION_COLUMNS",
      [
        "Invalid option columns:",
        "expect an array, a function or true,",
        `got ${JSON.stringify(e.columns)}`
      ],
      e
    );
  if (e.group_columns_by_name === void 0 || e.group_columns_by_name === null || e.group_columns_by_name === !1)
    e.group_columns_by_name = !1;
  else {
    if (e.group_columns_by_name !== !0)
      throw new c(
        "CSV_INVALID_OPTION_GROUP_COLUMNS_BY_NAME",
        [
          "Invalid option group_columns_by_name:",
          "expect an boolean,",
          `got ${JSON.stringify(e.group_columns_by_name)}`
        ],
        e
      );
    if (e.columns === !1)
      throw new c(
        "CSV_INVALID_OPTION_GROUP_COLUMNS_BY_NAME",
        [
          "Invalid option group_columns_by_name:",
          "the `columns` mode must be activated."
        ],
        e
      );
  }
  if (e.comment === void 0 || e.comment === null || e.comment === !1 || e.comment === "")
    e.comment = null;
  else if (typeof e.comment == "string" && (e.comment = Buffer.from(e.comment, e.encoding)), !Buffer.isBuffer(e.comment))
    throw new c(
      "CSV_INVALID_OPTION_COMMENT",
      [
        "Invalid option comment:",
        "comment must be a buffer or a string,",
        `got ${JSON.stringify(e.comment)}`
      ],
      e
    );
  if (e.comment_no_infix === void 0 || e.comment_no_infix === null || e.comment_no_infix === !1)
    e.comment_no_infix = !1;
  else if (e.comment_no_infix !== !0)
    throw new c(
      "CSV_INVALID_OPTION_COMMENT",
      [
        "Invalid option comment_no_infix:",
        "value must be a boolean,",
        `got ${JSON.stringify(e.comment_no_infix)}`
      ],
      e
    );
  const f = JSON.stringify(e.delimiter);
  if (Array.isArray(e.delimiter) || (e.delimiter = [e.delimiter]), e.delimiter.length === 0)
    throw new c(
      "CSV_INVALID_OPTION_DELIMITER",
      [
        "Invalid option delimiter:",
        "delimiter must be a non empty string or buffer or array of string|buffer,",
        `got ${f}`
      ],
      e
    );
  if (e.delimiter = e.delimiter.map(function(t) {
    if (t == null || t === !1)
      return Buffer.from(",", e.encoding);
    if (typeof t == "string" && (t = Buffer.from(t, e.encoding)), !Buffer.isBuffer(t) || t.length === 0)
      throw new c(
        "CSV_INVALID_OPTION_DELIMITER",
        [
          "Invalid option delimiter:",
          "delimiter must be a non empty string or buffer or array of string|buffer,",
          `got ${f}`
        ],
        e
      );
    return t;
  }), e.escape === void 0 || e.escape === !0 ? e.escape = Buffer.from('"', e.encoding) : typeof e.escape == "string" ? e.escape = Buffer.from(e.escape, e.encoding) : (e.escape === null || e.escape === !1) && (e.escape = null), e.escape !== null && !Buffer.isBuffer(e.escape))
    throw new Error(
      `Invalid Option: escape must be a buffer, a string or a boolean, got ${JSON.stringify(e.escape)}`
    );
  if (e.from === void 0 || e.from === null)
    e.from = 1;
  else if (typeof e.from == "string" && /\d+/.test(e.from) && (e.from = parseInt(e.from)), Number.isInteger(e.from)) {
    if (e.from < 0)
      throw new Error(
        `Invalid Option: from must be a positive integer, got ${JSON.stringify(r.from)}`
      );
  } else
    throw new Error(
      `Invalid Option: from must be an integer, got ${JSON.stringify(e.from)}`
    );
  if (e.from_line === void 0 || e.from_line === null)
    e.from_line = 1;
  else if (typeof e.from_line == "string" && /\d+/.test(e.from_line) && (e.from_line = parseInt(e.from_line)), Number.isInteger(e.from_line)) {
    if (e.from_line <= 0)
      throw new Error(
        `Invalid Option: from_line must be a positive integer greater than 0, got ${JSON.stringify(r.from_line)}`
      );
  } else
    throw new Error(
      `Invalid Option: from_line must be an integer, got ${JSON.stringify(r.from_line)}`
    );
  if (e.ignore_last_delimiters === void 0 || e.ignore_last_delimiters === null)
    e.ignore_last_delimiters = !1;
  else if (typeof e.ignore_last_delimiters == "number")
    e.ignore_last_delimiters = Math.floor(e.ignore_last_delimiters), e.ignore_last_delimiters === 0 && (e.ignore_last_delimiters = !1);
  else if (typeof e.ignore_last_delimiters != "boolean")
    throw new c(
      "CSV_INVALID_OPTION_IGNORE_LAST_DELIMITERS",
      [
        "Invalid option `ignore_last_delimiters`:",
        "the value must be a boolean value or an integer,",
        `got ${JSON.stringify(e.ignore_last_delimiters)}`
      ],
      e
    );
  if (e.ignore_last_delimiters === !0 && e.columns === !1)
    throw new c(
      "CSV_IGNORE_LAST_DELIMITERS_REQUIRES_COLUMNS",
      [
        "The option `ignore_last_delimiters`",
        "requires the activation of the `columns` option"
      ],
      e
    );
  if (e.info === void 0 || e.info === null || e.info === !1)
    e.info = !1;
  else if (e.info !== !0)
    throw new Error(
      `Invalid Option: info must be true, got ${JSON.stringify(e.info)}`
    );
  if (e.max_record_size === void 0 || e.max_record_size === null || e.max_record_size === !1)
    e.max_record_size = 0;
  else if (!(Number.isInteger(e.max_record_size) && e.max_record_size >= 0)) if (typeof e.max_record_size == "string" && /\d+/.test(e.max_record_size))
    e.max_record_size = parseInt(e.max_record_size);
  else
    throw new Error(
      `Invalid Option: max_record_size must be a positive integer, got ${JSON.stringify(e.max_record_size)}`
    );
  if (e.objname === void 0 || e.objname === null || e.objname === !1)
    e.objname = void 0;
  else if (Buffer.isBuffer(e.objname)) {
    if (e.objname.length === 0)
      throw new Error("Invalid Option: objname must be a non empty buffer");
    e.encoding === null || (e.objname = e.objname.toString(e.encoding));
  } else if (typeof e.objname == "string") {
    if (e.objname.length === 0)
      throw new Error("Invalid Option: objname must be a non empty string");
  } else if (typeof e.objname != "number") throw new Error(
    `Invalid Option: objname must be a string or a buffer, got ${e.objname}`
  );
  if (e.objname !== void 0) {
    if (typeof e.objname == "number") {
      if (e.columns !== !1)
        throw Error(
          "Invalid Option: objname index cannot be combined with columns or be defined as a field"
        );
    } else if (e.columns === !1)
      throw Error(
        "Invalid Option: objname field must be combined with columns or be defined as an index"
      );
  }
  if (e.on_record === void 0 || e.on_record === null)
    e.on_record = void 0;
  else if (typeof e.on_record != "function")
    throw new c(
      "CSV_INVALID_OPTION_ON_RECORD",
      [
        "Invalid option `on_record`:",
        "expect a function,",
        `got ${JSON.stringify(e.on_record)}`
      ],
      e
    );
  if (e.on_skip !== void 0 && e.on_skip !== null && typeof e.on_skip != "function")
    throw new Error(
      `Invalid Option: on_skip must be a function, got ${JSON.stringify(e.on_skip)}`
    );
  if (e.quote === null || e.quote === !1 || e.quote === "")
    e.quote = null;
  else if (e.quote === void 0 || e.quote === !0 ? e.quote = Buffer.from('"', e.encoding) : typeof e.quote == "string" && (e.quote = Buffer.from(e.quote, e.encoding)), !Buffer.isBuffer(e.quote))
    throw new Error(
      `Invalid Option: quote must be a buffer or a string, got ${JSON.stringify(e.quote)}`
    );
  if (e.raw === void 0 || e.raw === null || e.raw === !1)
    e.raw = !1;
  else if (e.raw !== !0)
    throw new Error(
      `Invalid Option: raw must be true, got ${JSON.stringify(e.raw)}`
    );
  if (e.record_delimiter === void 0)
    e.record_delimiter = [];
  else if (typeof e.record_delimiter == "string" || Buffer.isBuffer(e.record_delimiter)) {
    if (e.record_delimiter.length === 0)
      throw new c(
        "CSV_INVALID_OPTION_RECORD_DELIMITER",
        [
          "Invalid option `record_delimiter`:",
          "value must be a non empty string or buffer,",
          `got ${JSON.stringify(e.record_delimiter)}`
        ],
        e
      );
    e.record_delimiter = [e.record_delimiter];
  } else if (!Array.isArray(e.record_delimiter))
    throw new c(
      "CSV_INVALID_OPTION_RECORD_DELIMITER",
      [
        "Invalid option `record_delimiter`:",
        "value must be a string, a buffer or array of string|buffer,",
        `got ${JSON.stringify(e.record_delimiter)}`
      ],
      e
    );
  if (e.record_delimiter = e.record_delimiter.map(function(t, i) {
    if (typeof t != "string" && !Buffer.isBuffer(t))
      throw new c(
        "CSV_INVALID_OPTION_RECORD_DELIMITER",
        [
          "Invalid option `record_delimiter`:",
          "value must be a string, a buffer or array of string|buffer",
          `at index ${i},`,
          `got ${JSON.stringify(t)}`
        ],
        e
      );
    if (t.length === 0)
      throw new c(
        "CSV_INVALID_OPTION_RECORD_DELIMITER",
        [
          "Invalid option `record_delimiter`:",
          "value must be a non empty string or buffer",
          `at index ${i},`,
          `got ${JSON.stringify(t)}`
        ],
        e
      );
    return typeof t == "string" && (t = Buffer.from(t, e.encoding)), t;
  }), typeof e.relax_column_count != "boolean") if (e.relax_column_count === void 0 || e.relax_column_count === null)
    e.relax_column_count = !1;
  else
    throw new Error(
      `Invalid Option: relax_column_count must be a boolean, got ${JSON.stringify(e.relax_column_count)}`
    );
  if (typeof e.relax_column_count_less != "boolean") if (e.relax_column_count_less === void 0 || e.relax_column_count_less === null)
    e.relax_column_count_less = !1;
  else
    throw new Error(
      `Invalid Option: relax_column_count_less must be a boolean, got ${JSON.stringify(e.relax_column_count_less)}`
    );
  if (typeof e.relax_column_count_more != "boolean") if (e.relax_column_count_more === void 0 || e.relax_column_count_more === null)
    e.relax_column_count_more = !1;
  else
    throw new Error(
      `Invalid Option: relax_column_count_more must be a boolean, got ${JSON.stringify(e.relax_column_count_more)}`
    );
  if (typeof e.relax_quotes != "boolean") if (e.relax_quotes === void 0 || e.relax_quotes === null)
    e.relax_quotes = !1;
  else
    throw new Error(
      `Invalid Option: relax_quotes must be a boolean, got ${JSON.stringify(e.relax_quotes)}`
    );
  if (typeof e.skip_empty_lines != "boolean") if (e.skip_empty_lines === void 0 || e.skip_empty_lines === null)
    e.skip_empty_lines = !1;
  else
    throw new Error(
      `Invalid Option: skip_empty_lines must be a boolean, got ${JSON.stringify(e.skip_empty_lines)}`
    );
  if (typeof e.skip_records_with_empty_values != "boolean") if (e.skip_records_with_empty_values === void 0 || e.skip_records_with_empty_values === null)
    e.skip_records_with_empty_values = !1;
  else
    throw new Error(
      `Invalid Option: skip_records_with_empty_values must be a boolean, got ${JSON.stringify(e.skip_records_with_empty_values)}`
    );
  if (typeof e.skip_records_with_error != "boolean") if (e.skip_records_with_error === void 0 || e.skip_records_with_error === null)
    e.skip_records_with_error = !1;
  else
    throw new Error(
      `Invalid Option: skip_records_with_error must be a boolean, got ${JSON.stringify(e.skip_records_with_error)}`
    );
  if (e.rtrim === void 0 || e.rtrim === null || e.rtrim === !1)
    e.rtrim = !1;
  else if (e.rtrim !== !0)
    throw new Error(
      `Invalid Option: rtrim must be a boolean, got ${JSON.stringify(e.rtrim)}`
    );
  if (e.ltrim === void 0 || e.ltrim === null || e.ltrim === !1)
    e.ltrim = !1;
  else if (e.ltrim !== !0)
    throw new Error(
      `Invalid Option: ltrim must be a boolean, got ${JSON.stringify(e.ltrim)}`
    );
  if (e.trim === void 0 || e.trim === null || e.trim === !1)
    e.trim = !1;
  else if (e.trim !== !0)
    throw new Error(
      `Invalid Option: trim must be a boolean, got ${JSON.stringify(e.trim)}`
    );
  if (e.trim === !0 && r.ltrim !== !1 ? e.ltrim = !0 : e.ltrim !== !0 && (e.ltrim = !1), e.trim === !0 && r.rtrim !== !1 ? e.rtrim = !0 : e.rtrim !== !0 && (e.rtrim = !1), e.to === void 0 || e.to === null)
    e.to = -1;
  else if (e.to !== -1)
    if (typeof e.to == "string" && /\d+/.test(e.to) && (e.to = parseInt(e.to)), Number.isInteger(e.to)) {
      if (e.to <= 0)
        throw new Error(
          `Invalid Option: to must be a positive integer greater than 0, got ${JSON.stringify(r.to)}`
        );
    } else
      throw new Error(
        `Invalid Option: to must be an integer, got ${JSON.stringify(r.to)}`
      );
  if (e.to_line === void 0 || e.to_line === null)
    e.to_line = -1;
  else if (e.to_line !== -1)
    if (typeof e.to_line == "string" && /\d+/.test(e.to_line) && (e.to_line = parseInt(e.to_line)), Number.isInteger(e.to_line)) {
      if (e.to_line <= 0)
        throw new Error(
          `Invalid Option: to_line must be a positive integer greater than 0, got ${JSON.stringify(r.to_line)}`
        );
    } else
      throw new Error(
        `Invalid Option: to_line must be an integer, got ${JSON.stringify(r.to_line)}`
      );
  return e;
}, Q = function(r) {
  return r.every(
    (e) => e == null || e.toString && e.toString().trim() === ""
  );
}, ce = 13, _e = 10, L = {
  // Note, the following are equals:
  // Buffer.from("\ufeff")
  // Buffer.from([239, 187, 191])
  // Buffer.from('EFBBBF', 'hex')
  utf8: Buffer.from([239, 187, 191]),
  // Note, the following are equals:
  // Buffer.from "\ufeff", 'utf16le
  // Buffer.from([255, 254])
  utf16le: Buffer.from([255, 254])
}, de = function(r = {}) {
  const e = {
    bytes: 0,
    comment_lines: 0,
    empty_lines: 0,
    invalid_field_length: 0,
    lines: 1,
    records: 0
  }, f = U(r);
  return {
    info: e,
    original_options: r,
    options: f,
    state: ae(f),
    __needMoreData: function(t, i, s) {
      if (s) return !1;
      const { encoding: o, escape: n, quote: a } = this.options, { quoting: u, needMoreDataSize: g, recordDelimiterMaxLength: p } = this.state, N = i - t - 1, B = Math.max(
        g,
        // Skip if the remaining buffer smaller than record delimiter
        // If "record_delimiter" is yet to be discovered:
        // 1. It is equals to `[]` and "recordDelimiterMaxLength" equals `0`
        // 2. We set the length to windows line ending in the current encoding
        // Note, that encoding is known from user or bom discovery at that point
        // recordDelimiterMaxLength,
        p === 0 ? Buffer.from(`\r
`, o).length : p,
        // Skip if remaining buffer can be an escaped quote
        u ? (n === null ? 0 : n.length) + a.length : 0,
        // Skip if remaining buffer can be record delimiter following the closing quote
        u ? a.length + p : 0
      );
      return N < B;
    },
    // Central parser implementation
    parse: function(t, i, s, o) {
      const {
        bom: n,
        comment_no_infix: a,
        encoding: u,
        from_line: g,
        ltrim: p,
        max_record_size: N,
        raw: B,
        relax_quotes: $,
        rtrim: b,
        skip_empty_lines: R,
        to: y,
        to_line: m
      } = this.options;
      let { comment: _, escape: I, quote: O, record_delimiter: k } = this.options;
      const { bomSkipped: K, previousBuf: A, rawBuffer: ee, escapeIsQuote: te } = this.state;
      let d;
      if (A === void 0)
        if (t === void 0) {
          o();
          return;
        } else
          d = t;
      else A !== void 0 && t === void 0 ? d = A : d = Buffer.concat([A, t]);
      if (K === !1)
        if (n === !1)
          this.state.bomSkipped = !0;
        else if (d.length < 3) {
          if (i === !1) {
            this.state.previousBuf = d;
            return;
          }
        } else {
          for (const h in L)
            if (L[h].compare(d, 0, L[h].length) === 0) {
              const v = L[h].length;
              this.state.bufBytesStart += v, d = d.slice(v);
              const V = U({
                ...this.original_options,
                encoding: h
              });
              for (const w in V)
                this.options[w] = V[w];
              ({ comment: _, escape: I, quote: O } = this.options);
              break;
            }
          this.state.bomSkipped = !0;
        }
      const P = d.length;
      let l;
      for (l = 0; l < P && !this.__needMoreData(l, P, i); l++) {
        if (this.state.wasRowDelimiter === !0 && (this.info.lines++, this.state.wasRowDelimiter = !1), m !== -1 && this.info.lines > m) {
          this.state.stop = !0, o();
          return;
        }
        this.state.quoting === !1 && k.length === 0 && this.__autoDiscoverRecordDelimiter(
          d,
          l
        ) && (k = this.options.record_delimiter);
        const h = d[l];
        if (B === !0 && ee.append(h), (h === ce || h === _e) && this.state.wasRowDelimiter === !1 && (this.state.wasRowDelimiter = !0), this.state.escaping === !0)
          this.state.escaping = !1;
        else {
          if (I !== null && this.state.quoting === !0 && this.__isEscape(d, l, h) && l + I.length < P)
            if (te) {
              if (this.__isQuote(d, l + I.length)) {
                this.state.escaping = !0, l += I.length - 1;
                continue;
              }
            } else {
              this.state.escaping = !0, l += I.length - 1;
              continue;
            }
          if (this.state.commenting === !1 && this.__isQuote(d, l))
            if (this.state.quoting === !0) {
              const w = d[l + O.length], x = b && this.__isCharTrimable(d, l + O.length), E = _ !== null && this.__compareBytes(_, d, l + O.length, w), D = this.__isDelimiter(
                d,
                l + O.length,
                w
              ), q = k.length === 0 ? this.__autoDiscoverRecordDelimiter(d, l + O.length) : this.__isRecordDelimiter(w, d, l + O.length);
              if (I !== null && this.__isEscape(d, l, h) && this.__isQuote(d, l + I.length))
                l += I.length - 1;
              else if (!w || D || q || E || x) {
                this.state.quoting = !1, this.state.wasQuoting = !0, l += O.length - 1;
                continue;
              } else if ($ === !1) {
                const F = this.__error(
                  new c(
                    "CSV_INVALID_CLOSING_QUOTE",
                    [
                      "Invalid Closing Quote:",
                      `got "${String.fromCharCode(w)}"`,
                      `at line ${this.info.lines}`,
                      "instead of delimiter, record delimiter, trimable character",
                      "(if activated) or comment"
                    ],
                    this.options,
                    this.__infoField()
                  )
                );
                if (F !== void 0) return F;
              } else
                this.state.quoting = !1, this.state.wasQuoting = !0, this.state.field.prepend(O), l += O.length - 1;
            } else if (this.state.field.length !== 0) {
              if ($ === !1) {
                const w = this.__infoField(), x = Object.keys(L).map(
                  (D) => L[D].equals(this.state.field.toString()) ? D : !1
                ).filter(Boolean)[0], E = this.__error(
                  new c(
                    "INVALID_OPENING_QUOTE",
                    [
                      "Invalid Opening Quote:",
                      `a quote is found on field ${JSON.stringify(w.column)} at line ${w.lines}, value is ${JSON.stringify(this.state.field.toString(u))}`,
                      x ? `(${x} bom)` : void 0
                    ],
                    this.options,
                    w,
                    {
                      field: this.state.field
                    }
                  )
                );
                if (E !== void 0) return E;
              }
            } else {
              this.state.quoting = !0, l += O.length - 1;
              continue;
            }
          if (this.state.quoting === !1) {
            const w = this.__isRecordDelimiter(
              h,
              d,
              l
            );
            if (w !== 0) {
              if (this.state.commenting && this.state.wasQuoting === !1 && this.state.record.length === 0 && this.state.field.length === 0)
                this.info.comment_lines++;
              else {
                if (this.state.enabled === !1 && this.info.lines + (this.state.wasRowDelimiter === !0 ? 1 : 0) >= g) {
                  this.state.enabled = !0, this.__resetField(), this.__resetRecord(), l += w - 1;
                  continue;
                }
                if (R === !0 && this.state.wasQuoting === !1 && this.state.record.length === 0 && this.state.field.length === 0) {
                  this.info.empty_lines++, l += w - 1;
                  continue;
                }
                this.info.bytes = this.state.bufBytesStart + l;
                const D = this.__onField();
                if (D !== void 0) return D;
                this.info.bytes = this.state.bufBytesStart + l + w;
                const q = this.__onRecord(s);
                if (q !== void 0) return q;
                if (y !== -1 && this.info.records >= y) {
                  this.state.stop = !0, o();
                  return;
                }
              }
              this.state.commenting = !1, l += w - 1;
              continue;
            }
            if (this.state.commenting)
              continue;
            if (_ !== null && (a === !1 || this.state.record.length === 0 && this.state.field.length === 0) && this.__compareBytes(_, d, l, h) !== 0) {
              this.state.commenting = !0;
              continue;
            }
            const x = this.__isDelimiter(d, l, h);
            if (x !== 0) {
              this.info.bytes = this.state.bufBytesStart + l;
              const E = this.__onField();
              if (E !== void 0) return E;
              l += x - 1;
              continue;
            }
          }
        }
        if (this.state.commenting === !1 && N !== 0 && this.state.record_length + this.state.field.length > N)
          return this.__error(
            new c(
              "CSV_MAX_RECORD_SIZE",
              [
                "Max Record Size:",
                "record exceed the maximum number of tolerated bytes",
                `of ${N}`,
                `at line ${this.info.lines}`
              ],
              this.options,
              this.__infoField()
            )
          );
        const v = p === !1 || this.state.quoting === !0 || this.state.field.length !== 0 || !this.__isCharTrimable(d, l), V = b === !1 || this.state.wasQuoting === !1;
        if (v === !0 && V === !0)
          this.state.field.append(h);
        else {
          if (b === !0 && !this.__isCharTrimable(d, l))
            return this.__error(
              new c(
                "CSV_NON_TRIMABLE_CHAR_AFTER_CLOSING_QUOTE",
                [
                  "Invalid Closing Quote:",
                  "found non trimable byte after quote",
                  `at line ${this.info.lines}`
                ],
                this.options,
                this.__infoField()
              )
            );
          v === !1 && (l += this.__isCharTrimable(d, l) - 1);
          continue;
        }
      }
      if (i === !0)
        if (this.state.quoting === !0) {
          const h = this.__error(
            new c(
              "CSV_QUOTE_NOT_CLOSED",
              [
                "Quote Not Closed:",
                `the parsing is finished with an opening quote at line ${this.info.lines}`
              ],
              this.options,
              this.__infoField()
            )
          );
          if (h !== void 0) return h;
        } else if (this.state.wasQuoting === !0 || this.state.record.length !== 0 || this.state.field.length !== 0) {
          this.info.bytes = this.state.bufBytesStart + l;
          const h = this.__onField();
          if (h !== void 0) return h;
          const v = this.__onRecord(s);
          if (v !== void 0) return v;
        } else this.state.wasRowDelimiter === !0 ? this.info.empty_lines++ : this.state.commenting === !0 && this.info.comment_lines++;
      else
        this.state.bufBytesStart += l, this.state.previousBuf = d.slice(l);
      this.state.wasRowDelimiter === !0 && (this.info.lines++, this.state.wasRowDelimiter = !1);
    },
    __onRecord: function(t) {
      const {
        columns: i,
        group_columns_by_name: s,
        encoding: o,
        info: n,
        from: a,
        relax_column_count: u,
        relax_column_count_less: g,
        relax_column_count_more: p,
        raw: N,
        skip_records_with_empty_values: B
      } = this.options, { enabled: $, record: b } = this.state;
      if ($ === !1)
        return this.__resetRecord();
      const R = b.length;
      if (i === !0) {
        if (B === !0 && Q(b)) {
          this.__resetRecord();
          return;
        }
        return this.__firstLineToColumns(b);
      }
      if (i === !1 && this.info.records === 0 && (this.state.expectedRecordLength = R), R !== this.state.expectedRecordLength) {
        const y = i === !1 ? new c(
          "CSV_RECORD_INCONSISTENT_FIELDS_LENGTH",
          [
            "Invalid Record Length:",
            `expect ${this.state.expectedRecordLength},`,
            `got ${R} on line ${this.info.lines}`
          ],
          this.options,
          this.__infoField(),
          {
            record: b
          }
        ) : new c(
          "CSV_RECORD_INCONSISTENT_COLUMNS",
          [
            "Invalid Record Length:",
            `columns length is ${i.length},`,
            // rename columns
            `got ${R} on line ${this.info.lines}`
          ],
          this.options,
          this.__infoField(),
          {
            record: b
          }
        );
        if (u === !0 || g === !0 && R < this.state.expectedRecordLength || p === !0 && R > this.state.expectedRecordLength)
          this.info.invalid_field_length++, this.state.error = y;
        else {
          const m = this.__error(y);
          if (m) return m;
        }
      }
      if (B === !0 && Q(b)) {
        this.__resetRecord();
        return;
      }
      if (this.state.recordHasError === !0) {
        this.__resetRecord(), this.state.recordHasError = !1;
        return;
      }
      if (this.info.records++, a === 1 || this.info.records >= a) {
        const { objname: y } = this.options;
        if (i !== !1) {
          const m = {};
          for (let _ = 0, I = b.length; _ < I; _++)
            i[_] === void 0 || i[_].disabled || (s === !0 && m[i[_].name] !== void 0 ? Array.isArray(m[i[_].name]) ? m[i[_].name] = m[i[_].name].concat(b[_]) : m[i[_].name] = [m[i[_].name], b[_]] : m[i[_].name] = b[_]);
          if (N === !0 || n === !0) {
            const _ = Object.assign(
              { record: m },
              N === !0 ? { raw: this.state.rawBuffer.toString(o) } : {},
              n === !0 ? { info: this.__infoRecord() } : {}
            ), I = this.__push(
              y === void 0 ? _ : [m[y], _],
              t
            );
            if (I)
              return I;
          } else {
            const _ = this.__push(
              y === void 0 ? m : [m[y], m],
              t
            );
            if (_)
              return _;
          }
        } else if (N === !0 || n === !0) {
          const m = Object.assign(
            { record: b },
            N === !0 ? { raw: this.state.rawBuffer.toString(o) } : {},
            n === !0 ? { info: this.__infoRecord() } : {}
          ), _ = this.__push(
            y === void 0 ? m : [b[y], m],
            t
          );
          if (_)
            return _;
        } else {
          const m = this.__push(
            y === void 0 ? b : [b[y], b],
            t
          );
          if (m)
            return m;
        }
      }
      this.__resetRecord();
    },
    __firstLineToColumns: function(t) {
      const { firstLineToHeaders: i } = this.state;
      try {
        const s = i === void 0 ? t : i.call(null, t);
        if (!Array.isArray(s))
          return this.__error(
            new c(
              "CSV_INVALID_COLUMN_MAPPING",
              [
                "Invalid Column Mapping:",
                "expect an array from column function,",
                `got ${JSON.stringify(s)}`
              ],
              this.options,
              this.__infoField(),
              {
                headers: s
              }
            )
          );
        const o = W(s);
        this.state.expectedRecordLength = o.length, this.options.columns = o, this.__resetRecord();
        return;
      } catch (s) {
        return s;
      }
    },
    __resetRecord: function() {
      this.options.raw === !0 && this.state.rawBuffer.reset(), this.state.error = void 0, this.state.record = [], this.state.record_length = 0;
    },
    __onField: function() {
      const { cast: t, encoding: i, rtrim: s, max_record_size: o } = this.options, { enabled: n, wasQuoting: a } = this.state;
      if (n === !1)
        return this.__resetField();
      let u = this.state.field.toString(i);
      if (s === !0 && a === !1 && (u = u.trimRight()), t === !0) {
        const [g, p] = this.__cast(u);
        if (g !== void 0) return g;
        u = p;
      }
      this.state.record.push(u), o !== 0 && typeof u == "string" && (this.state.record_length += u.length), this.__resetField();
    },
    __resetField: function() {
      this.state.field.reset(), this.state.wasQuoting = !1;
    },
    __push: function(t, i) {
      const { on_record: s } = this.options;
      if (s !== void 0) {
        const o = this.__infoRecord();
        try {
          t = s.call(null, t, o);
        } catch (n) {
          return n;
        }
        if (t == null)
          return;
      }
      i(t);
    },
    // Return a tuple with the error and the casted value
    __cast: function(t) {
      const { columns: i, relax_column_count: s } = this.options;
      if (Array.isArray(i) === !0 && s && this.options.columns.length <= this.state.record.length)
        return [void 0, void 0];
      if (this.state.castField !== null)
        try {
          const n = this.__infoField();
          return [void 0, this.state.castField.call(null, t, n)];
        } catch (n) {
          return [n];
        }
      if (this.__isFloat(t))
        return [void 0, parseFloat(t)];
      if (this.options.cast_date !== !1) {
        const n = this.__infoField();
        return [void 0, this.options.cast_date.call(null, t, n)];
      }
      return [void 0, t];
    },
    // Helper to test if a character is a space or a line delimiter
    __isCharTrimable: function(t, i) {
      return ((o, n) => {
        const { timchars: a } = this.state;
        e: for (let u = 0; u < a.length; u++) {
          const g = a[u];
          for (let p = 0; p < g.length; p++)
            if (g[p] !== o[n + p]) continue e;
          return g.length;
        }
        return 0;
      })(t, i);
    },
    // Keep it in case we implement the `cast_int` option
    // __isInt(value){
    //   // return Number.isInteger(parseInt(value))
    //   // return !isNaN( parseInt( obj ) );
    //   return /^(\-|\+)?[1-9][0-9]*$/.test(value)
    // }
    __isFloat: function(t) {
      return t - parseFloat(t) + 1 >= 0;
    },
    __compareBytes: function(t, i, s, o) {
      if (t[0] !== o) return 0;
      const n = t.length;
      for (let a = 1; a < n; a++)
        if (t[a] !== i[s + a]) return 0;
      return n;
    },
    __isDelimiter: function(t, i, s) {
      const { delimiter: o, ignore_last_delimiters: n } = this.options;
      if (n === !0 && this.state.record.length === this.options.columns.length - 1)
        return 0;
      if (n !== !1 && typeof n == "number" && this.state.record.length === n - 1)
        return 0;
      e: for (let a = 0; a < o.length; a++) {
        const u = o[a];
        if (u[0] === s) {
          for (let g = 1; g < u.length; g++)
            if (u[g] !== t[i + g]) continue e;
          return u.length;
        }
      }
      return 0;
    },
    __isRecordDelimiter: function(t, i, s) {
      const { record_delimiter: o } = this.options, n = o.length;
      e: for (let a = 0; a < n; a++) {
        const u = o[a], g = u.length;
        if (u[0] === t) {
          for (let p = 1; p < g; p++)
            if (u[p] !== i[s + p])
              continue e;
          return u.length;
        }
      }
      return 0;
    },
    __isEscape: function(t, i, s) {
      const { escape: o } = this.options;
      if (o === null) return !1;
      const n = o.length;
      if (o[0] === s) {
        for (let a = 0; a < n; a++)
          if (o[a] !== t[i + a])
            return !1;
        return !0;
      }
      return !1;
    },
    __isQuote: function(t, i) {
      const { quote: s } = this.options;
      if (s === null) return !1;
      const o = s.length;
      for (let n = 0; n < o; n++)
        if (s[n] !== t[i + n])
          return !1;
      return !0;
    },
    __autoDiscoverRecordDelimiter: function(t, i) {
      const { encoding: s } = this.options, o = [
        // Important, the windows line ending must be before mac os 9
        Buffer.from(`\r
`, s),
        Buffer.from(`
`, s),
        Buffer.from("\r", s)
      ];
      e: for (let n = 0; n < o.length; n++) {
        const a = o[n].length;
        for (let u = 0; u < a; u++)
          if (o[n][u] !== t[i + u])
            continue e;
        return this.options.record_delimiter.push(o[n]), this.state.recordDelimiterMaxLength = o[n].length, o[n].length;
      }
      return 0;
    },
    __error: function(t) {
      const { encoding: i, raw: s, skip_records_with_error: o } = this.options, n = typeof t == "string" ? new Error(t) : t;
      if (o) {
        if (this.state.recordHasError = !0, this.options.on_skip !== void 0)
          try {
            this.options.on_skip(
              n,
              s ? this.state.rawBuffer.toString(i) : void 0
            );
          } catch (a) {
            return a;
          }
        return;
      } else
        return n;
    },
    __infoDataSet: function() {
      return {
        ...this.info,
        columns: this.options.columns
      };
    },
    __infoRecord: function() {
      const { columns: t, raw: i, encoding: s } = this.options;
      return {
        ...this.__infoDataSet(),
        error: this.state.error,
        header: t === !0,
        index: this.state.record.length,
        raw: i ? this.state.rawBuffer.toString(s) : void 0
      };
    },
    __infoField: function() {
      const { columns: t } = this.options, i = Array.isArray(t);
      return {
        ...this.__infoRecord(),
        column: i === !0 ? t.length > this.state.record.length ? t[this.state.record.length].name : null : this.state.record.length,
        quoting: this.state.wasQuoting
      };
    }
  };
}, me = function(r, e = {}) {
  typeof r == "string" && (r = Buffer.from(r));
  const f = e && e.objname ? {} : [], t = de(e), i = (n) => {
    t.options.objname === void 0 ? f.push(n) : f[n[0]] = n[1];
  }, s = () => {
  }, o = t.parse(r, !0, i, s);
  if (o !== void 0) throw o;
  return f;
}, Y = S.dirname(ie(import.meta.url));
process.env.APP_ROOT = S.join(Y, "..");
const j = process.env.VITE_DEV_SERVER_URL, we = S.join(process.env.APP_ROOT, "dist-electron"), Z = S.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = j ? S.join(process.env.APP_ROOT, "public") : Z;
let C;
const M = j ? S.join(process.env.APP_ROOT, "words.csv") : S.join(S.dirname(T.getAppPath()), "..", "words.csv");
J.existsSync(M) || J.promises.writeFile(M, `chinese,english,count
`);
G.handle("readWords", async (r) => {
  const e = await J.promises.readFile(M, "utf-8");
  return me(e, {
    columns: !0,
    skip_empty_lines: !0
  });
});
G.handle("writeWords", async (r, e) => {
  const f = `chinese,english,count
`, t = e.map((i) => `${i.chinese},${i.english},${i.count}`);
  await J.promises.writeFile(M, f + t.join(`
`));
});
function X() {
  C = new H({
    title: "单词",
    autoHideMenuBar: !0,
    icon: S.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: S.join(Y, "preload.mjs")
    }
  }), C.webContents.on("did-finish-load", () => {
    C == null || C.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), j ? C.loadURL(j) : C.loadFile(S.join(Z, "index.html"));
}
T.on("window-all-closed", () => {
  process.platform !== "darwin" && (T.quit(), C = null);
});
T.on("activate", () => {
  H.getAllWindows().length === 0 && X();
});
T.whenReady().then(X);
export {
  we as MAIN_DIST,
  Z as RENDERER_DIST,
  j as VITE_DEV_SERVER_URL
};
