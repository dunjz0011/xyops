# Định Dạng Expression của PTOps

## Tổng Quan

PTOps sử dụng một cú pháp expression tuỳ chỉnh xây dựng trên nền [JavaScript Expression Language](https://www.npmjs.com/package/jexl) (hay JEXL) mã nguồn mở. Chúng ta mở rộng JEXL bằng cách thêm một bộ hàm tuỳ chỉnh mà bạn có thể gọi từ trong expression (xem bên dưới), và cũng cho phép mở rộng macro nội tuyến (inline) trong đánh giá chuỗi, sử dụng cú pháp `{{ mustache }}` phổ biến. Điều này được dùng để cung cấp năng lượng cho các hệ thống con sau của PTOps:

- Monitor Expressions
- Alert Trigger Expressions
- Alert Messages
- Plugin Parameters
- Workflow Decision Controllers
- Workflow Split Controllers
- Web Hook Messages
- Email Templates

Định Dạng Expression của PTOps là cú pháp giống JavaScript với dot path, chỉ mục mảng (array indexing), toán tử số học và boolean. Sử dụng nó bạn có thể duyệt qua các cây object sâu (ví dụ [ServerMonitorData](data.md#servermonitordata)), lấy ra từng giá trị riêng lẻ, và thực hiện các phép toán trên một hoặc nhiều giá trị.

Vì được xây dựng trên JEXL, bạn có thể dễ dàng duyệt qua mảng các object, và chọn item từ một mảng dựa trên key của sub-object. Xem ví dụ bên dưới để biết chi tiết.

### Ví Dụ

- **Monitor Expression**: `processes.list[.command == 'ffmpeg'].memRss`
- **Alert Expression**: `monitors.load_avg >= (cpu.cores + 1)`
- **Alert Message**: `Less than 5% of total memory is available ({{bytes(memory.available)}} of {{bytes(memory.total)}})`

## Hàm Tuỳ Chỉnh

Bên cạnh các toán tử JEXL chuẩn, các hàm tuỳ chỉnh sau có sẵn để sử dụng trong expression:

### Toán Học và Mảng

| Hàm | Cách Dùng | Mô Tả |
|----------|-------|-------------|
| `min` | `min(4, 5) == 4` | Xem [Math.min](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/min). |
| `max` | `min(4, 5) == 5` | Xem [Math.max](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max). |
| `floor` | `floor(1.2) == 1` | Xem [Math.floor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/floor). |
| `ceil` | `ceil(1.2) == 2` | Xem [Math.ceil](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/ceil). |
| `round` | `round(1.2) == 1` | Xem [Math.round](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round). |
| `clamp` | `clamp(50, 0, 100) == 50` | Kẹp (clamp) một giá trị số giữa giới hạn dưới và giới hạn trên. |
| `count` | `count(array)` | Trả về số lượng item trong một mảng (vì mảng JEXL không có `length` trong expression). |

### Tìm Kiếm

| Hàm | Cách Dùng | Mô Tả |
|----------|-------|-------------|
| `find` | `find(array, key, value)` | Tìm object trong một mảng dùng một property được đặt tên và khớp chuỗi con (substring match). |
| `includes` | `includes(array, key)` | Tìm chuỗi con trong một chuỗi, hoặc một phần tử trong mảng. |
| `match` | `match(string, pattern)` | Thực hiện khớp regex trên một chuỗi. Pattern cũng phải được chỉ định dưới dạng chuỗi. |

### Định Dạng Chuỗi

| Hàm | Cách Dùng | Mô Tả |
|----------|-------|-------------|
| `bytes` | `bytes(1048576) == "1 MB"` | Trả về kích thước dễ đọc dựa trên số byte thô. |
| `number` | `number(1048576) == "1,048,576"` | Trả về số đã định dạng dễ đọc theo locale (theo locale của server). |
| `pct` | `pct(0.5, 1.0) == "50%"` | Trả về phần trăm dễ đọc dựa trên một giá trị và giá trị tối đa. |
| `integer` | `integer("1abc") == "1"` | Cố gắng ép ra một số nguyên từ một chuỗi. |
| `float` | `float(1.33333333) == "1.33"` | Rút gọn một số thực xuống tối đa 2 chữ số sau dấu chấm thập phân. |

### Khác

| Hàm | Cách Dùng | Mô Tả |
|----------|-------|-------------|
| `encode` | `encode("a b") == "a%20b` | Gọi [encodeURIComponent](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) để mã hoá một chuỗi. |
| `stringify` | `stringify(obj) == "{...}"` | Gọi [JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) để serialize một object thành chuỗi. |
| `server` | `server("smog7ph67nvh6891z") == "myhostname.domain.com"` | Phân giải một Server ID thành label của nó (hoặc hostname nếu không có label). |
| `event` | `event("emq3y5434ggm74ezk") == "Backup Database"` | Phân giải một Event ID hoặc Job ID thành tiêu đề event. |

## Xem Thêm

- [Monitor Expressions](monitors.md#expressions)
- [Alert Expressions](alerts.md#alert-expressions)
- [Alert Messages](alerts.md#alert-messages)
- [Plugin Parameter Macro Expansion](plugins.md#macro-expansion)
- [Workflow Decision Controller](workflows.md#decision-controller)
- [Workflow Split Controller](workflows.md#split-controller)
