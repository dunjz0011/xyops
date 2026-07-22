# Triggers

## Tổng Quan

Trigger trong PTOps định nghĩa khi nào và cách nào một event (hoặc workflow) được phép chạy job. Bạn kết hợp một hoặc nhiều trigger trên một event để mô tả lịch tự động, khởi chạy một lần, kiểm soát thủ công, khoảng thời gian blackout, và các hành vi tuỳ chọn như catch-up, delay, và độ chính xác dưới phút (sub-minute precision). Scheduler đánh giá trigger mỗi phút một lần (có tuỳ chọn độ chính xác cấp giây), khởi chạy các job khớp, và thực thi mọi tuỳ chọn.

Tài liệu này giải thích cách trigger hoạt động, cách chúng kết hợp, và chi tiết từng loại trigger với tham số và ví dụ.

## Điểm Chính

- Mỗi trigger là một object định nghĩa nhỏ với hai trường cốt lõi: `enabled` và `type`. Các trường bổ sung tuỳ theo loại.
- Một event có thể có nhiều trigger. Một số loại tạo ra lần khởi chạy (schedule, interval, single). Các loại khác bổ sung hoặc ràng buộc việc lập lịch (manual, catchup, nth, range, blackout, delay, precision, plugin).
- Scheduler chạy trên conductor mỗi phút một lần. Đối với trigger schedule/interval/plugin, nó tính toán các phút khớp (và tuỳ chọn giây) và khởi chạy job tương ứng.
- Timezone được hỗ trợ cho trigger schedule/plugin qua trường `timezone`. Thời gian range/blackout/interval là "tuyệt đối" và do đó không phụ thuộc timezone.

Ví dụ trigger tối thiểu (định dạng JSON):

```json
{
  "type": "schedule",
  "enabled": true,
  "minutes": [0]
}
```

Điều này sẽ chạy đúng một lần mỗi giờ, vào phút `0`. Nó tương đương với `0 * * * *` trong cú pháp cron.

## Giao Diện Người Dùng

- Trigger có thể được thêm khi tạo hoặc chỉnh sửa event. Chúng được liệt kê trong một bảng ngay trên các limit của event, với nút "Add Trigger".
- Đối với workflow, trigger được thêm dưới dạng node trên đồ thị, sau đó được kết nối với các node khác để thiết lập các điểm vào (entrypoint) có thể khác nhau cho từng trigger.

## Đối Tượng Trigger

Tất cả object trigger bao gồm các thuộc tính chung này:

| Thuộc tính | Loại | Mô tả |
|---------|------|-------------|
| `enabled` | Boolean | Bật (`true`) hoặc tắt (`false`) trigger. Trigger bị tắt sẽ bị bỏ qua. |
| `type` | String | Áp dụng hành vi trigger nào. Xem Loại Trigger dưới đây. |

Các thuộc tính bổ sung được yêu cầu tuỳ theo loại trigger.

## Quy Tắc Kết Hợp

Một số kết hợp bị hạn chế để giữ việc lập lịch không mập mờ. Các quy tắc này được API và UI thực thi:

- Duy nhất (khi enabled): Chỉ một trong mỗi loại cho mỗi event: `manual`, `catchup`, `range`, `precision`, `delay`.
- Loại trừ lẫn nhau (khi enabled):
  - `interval` và `precision` loại trừ lẫn nhau.
  - `interval` và `delay` loại trừ lẫn nhau.
  - `precision` và `delay` loại trừ lẫn nhau.
- Trigger khởi chạy: Chỉ `manual`, `schedule`, `interval`, và `single` tạo ra lần khởi chạy. Các loại khác đóng vai trò bổ sung hoặc ràng buộc.
- Trigger range là bổ sung, chỉ cho phép khởi chạy giữa một ngày/giờ bắt đầu và kết thúc.
- Trigger blackout là nghịch đảo của range; chúng không cho phép khởi chạy giữa một ngày/giờ bắt đầu và kết thúc.
- Bạn có thể thêm nhiều range và blackout.

## Các Loại Trigger

Các loại trigger sau đây có sẵn.

### Manual Run

Cho phép event được khởi chạy theo yêu cầu bởi người dùng (UI) và API key (API). Không tạo ra lần chạy tự động. Bỏ qua các bổ sung như [Catch-Up](#catch-up), [Range](#range), [Blackout](#blackout), [Delay](#delay), [Precision](#precision), [Quiet](#quiet), và [Plugin](#plugin).

Tham số: Không có

Lưu ý:

- Nếu event không có trigger `manual` được enable, các lần thử chạy nó qua API/UI sẽ bị từ chối (trừ khi dùng đường dẫn test).

Ví dụ:

```json
{
  "type": "manual",
  "enabled": true
}
```

### Schedule

Định nghĩa lịch lặp lại tương tự [Unix Cron](https://en.wikipedia.org/wiki/Cron) dùng array năm, tháng, ngày, ngày trong tuần, giờ, và phút. Các trường bị bỏ qua nghĩa là "tất cả" trong hạng mục đó. Đánh giá diễn ra theo timezone được chọn (hoặc timezone mặc định của server nếu bỏ qua).

Tham số:

| Tên | Loại | Bắt buộc | Mô tả |
|------|------|----------|-------------|
| `years` | Array(Number) | Tuỳ chọn | Một hoặc nhiều năm dạng YYYY. |
| `months` | Array(Number) | Tuỳ chọn | Tháng 1-12 (Th1=1 ... Th12=12). |
| `days` | Array(Number) | Tuỳ chọn | Ngày trong tháng 1-31, hoặc ngày ngược trong tháng −1 đến −7 (−1 = ngày cuối, −2 = ngày kế cuối, v.v.). |
| `weekdays` | Array(Number) | Tuỳ chọn | Ngày trong tuần 0-6 (CN=0 ... T7=6). |
| `hours` | Array(Number) | Tuỳ chọn | Giờ 0-23 (đồng hồ 24 giờ). |
| `minutes` | Array(Number) | Tuỳ chọn | Phút 0-59. |
| `timezone` | String | Tuỳ chọn | Timezone IANA để đánh giá lịch (mặc định là timezone server). |
| `params` | Object | Tuỳ chọn | Tuỳ chọn bao gồm override tham số cho event / plugin. |
| `tags` | Array | Tuỳ chọn | Tuỳ chọn bao gồm một tập [Tag.id](data.md#tag-id) để thêm vào job khi nó khởi chạy. |

Lưu ý:

- Bạn có thể chỉ định cả `days` và `weekdays`. Tất cả tiêu chí phải khớp.
- Nếu bất kỳ danh sách nào rỗng hoặc bị bỏ qua, nó được coi là "tất cả" (tương đương `*` trong cron).
- Ngày ngược trong tháng cho phép biểu thức kiểu "ngày cuối cùng của tháng".

Ví dụ: Hai lần mỗi ngày vào 4:30 sáng và 4:30 chiều theo `America/New_York`:

```json
{
  "type": "schedule",
  "enabled": true,
  "hours": [4, 16],
  "minutes": [30],
  "timezone": "America/New_York"
}
```

Ví dụ: Ngày cuối cùng mỗi tháng vào 23:55:

```json
{
  "type": "schedule",
  "enabled": true,
  "days": [-1],
  "hours": [23],
  "minutes": [55]
}
```

### Interval

Chạy event theo khoảng cố định bắt đầu từ một epoch cụ thể. Không phụ thuộc timezone và có thể khởi chạy nhiều job trong phút hiện tại tại các mốc giây khác nhau.

Tham số:

| Tên | Loại | Bắt buộc | Mô tả |
|------|------|----------|-------------|
| `start` | Number | Có | Thời gian bắt đầu dạng Unix timestamp (giây). Lần khởi chạy đầu tiên xảy ra vào hoặc sau thời gian này, canh theo interval. |
| `duration` | Number | Có | Độ dài interval tính bằng giây. Phải > 0. |
| `params` | Object | Tuỳ chọn | Tuỳ chọn bao gồm override tham số cho event / plugin. |
| `tags` | Array | Tuỳ chọn | Tuỳ chọn bao gồm một tập [Tag.id](data.md#tag-id) để thêm vào job khi nó khởi chạy. |

Lưu ý:

- Scheduler tính toán tất cả các lần khớp trong phút hiện tại và khởi chạy vào đúng (các) giây.
- Loại trừ lẫn nhau với `precision` và `delay`.

Ví dụ: Mỗi 90 giây bắt đầu từ một thời điểm cụ thể:

```json
{
  "type": "interval",
  "enabled": true,
  "start": 1754580000,
  "duration": 90
}
```

### Single Shot

Khởi chạy đúng một lần vào timestamp tuyệt đối được chỉ định.

Tham số:

| Tên | Loại | Bắt buộc | Mô tả |
|------|------|----------|-------------|
| `epoch` | Number | Có | Unix timestamp chính xác (giây) khi cần chạy. |
| `params` | Object | Tuỳ chọn | Tuỳ chọn bao gồm override tham số cho event / plugin. |
| `tags` | Array | Tuỳ chọn | Tuỳ chọn bao gồm một tập [Tag.id](data.md#tag-id) để thêm vào job khi nó khởi chạy. |

Ví dụ:

```json
{
  "type": "single",
  "enabled": true,
  "epoch": 1754631600
}
```

### Magic Link

Loại trigger này tạo ra một URL duy nhất để khởi chạy job từ một web request (tức là một "incoming web hook"). Việc xác thực được tích hợp sẵn trong URL qua một token mã hoá duy nhất. Hai link khác nhau được cung cấp cho người dùng khi tạo trigger:

- Một link trực tiếp để khởi chạy job qua một yêu cầu URL đơn giản (response là JSON).
- Một link đến trang landing HTML độc lập (không cần đăng nhập), nơi người dùng có thể cung cấp tham số event, và upload file (nếu được cho phép).

Đối với link trực tiếp, bạn có thể bao gồm bất kỳ query string và/hoặc tham số POST nào cùng với request, và chúng sẽ được truyền trực tiếp vào object [Job.params](data.md#job-params) cho job đang chạy. Sau đó bạn có thể truy cập chúng trong script plugin job bằng cách đọc JSON từ STDIN, hoặc dùng biến môi trường.

Đối với trang landing, khi job khởi chạy, tiến trình được stream trở lại trang để cập nhật trực tiếp. Khi job hoàn tất, người dùng được hiển thị kết quả job, bao gồm mọi file output, dữ liệu, và nội dung khác do người dùng cung cấp trong job.

Đây là trigger "theo yêu cầu" (on-demand), và do đó nó bỏ qua các bổ sung như [Catch-Up](#catch-up), [Range](#range), [Blackout](#blackout), [Delay](#delay), [Precision](#precision), [Quiet](#quiet), và [Plugin](#plugin).

Tham số Trigger:

| Tên | Loại | Bắt buộc | Mô tả |
|------|------|----------|-------------|
| `key` | String | Có | Khi tạo, client cung cấp key dạng plain text, sau đó được hash thành token ở phía server. Key gốc không bao giờ được lưu trữ. |
| `token` | String | n/a | Khi tạo, `key` được hash (dùng salted SHA-256) để tạo token mã hoá được lưu trong thuộc tính này. |
| `body` | String | Tuỳ chọn | Văn bản Markdown tuỳ chỉnh để render lên trang landing. |

Ví dụ:

```json
{
  "type": "magic",
  "enabled": true,
  "token": "592b38cb583c1d028dde1dc7ec69a4865c321dd2e4ce09f4700f286ec7f18021",
  "body": "Hello!  This is custom **markdown** content for the _landing page_!"
}
```

Magic Link có một số tính năng nâng cao, có sẵn bằng cách bao gồm các HTML comment được định dạng đặc biệt trong văn bản body trang landing tuỳ chỉnh của bạn. Đầu tiên, bạn có thể tuỳ chỉnh nút "Start Job" và icon bằng cách bao gồm hai HTML comment tag này:

```html
<!-- Button: My Button -->
<!-- Icon: cat -->
```

Icon nên là một Icon ID hợp lệ từ [Material Design Icons](https://pictogrammers.com/library/mdi/).

Thứ hai, bạn có thể làm form magic bỏ qua việc stream tiến trình job và dữ liệu kết quả job, và thay vào đó chỉ hiển thị một response thành công tĩnh. Để làm điều này, bao gồm HTML comment tag này:

```html
<!-- Response: Your request was received successfully -->
```

Nếu một `Response` tuỳ chỉnh được cung cấp, job sẽ chạy ở background, và người dùng ngay lập tức được hiển thị một màn hình thành công "giả" (faux), với văn bản được cung cấp. Trong trường hợp này response output, file, và dữ liệu của job bị ẩn khỏi người dùng.

### Keyboard

Loại trigger này gắn event với một hoặc nhiều tổ hợp phím tắt, để bất kỳ user (có đủ privilege) có thể chạy job bằng cách nhấn tổ hợp phím khi đăng nhập vào UI của PTOps.

Tham số:

| Tên | Loại | Bắt buộc | Mô tả |
|------|------|----------|-------------|
| `keys` | Array | Bắt buộc | Array các phím tắt được gán cho event. Xem dưới đây. |
| `watch` | Boolean | Tuỳ chọn | Đặt là `true` để chuyển hướng người dùng đến trang Job Details ngay khi job bắt đầu. |
| `params` | Object | Tuỳ chọn | Tuỳ chọn bao gồm override tham số cho event / plugin. |
| `tags` | Array | Tuỳ chọn | Tuỳ chọn bao gồm một tập [Tag.id](data.md#tag-id) để thêm vào job khi nó khởi chạy. |

Các phần tử array `keys` nên là chuỗi, chứa một hoặc nhiều giá trị [KeyboardEvent.code](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code) phân tách bằng `+`. Ví dụ: `Control+KeyA`, `Control+Alt+Space`, `Meta+Digit1`. Lưu ý rằng các bộ điều biến (modifier) `Left` và `Right` không được sử dụng.

Đây là trigger trường hợp đặc biệt, và do đó nó bỏ qua các bổ sung như [Catch-Up](#catch-up), [Range](#range), [Blackout](#blackout), [Delay](#delay), [Precision](#precision), [Quiet](#quiet), và [Plugin](#plugin).

### Startup

Trigger này sẽ tự động chạy một job cho event khi PTOps khởi động. Cụ thể, điều này xảy ra khi dịch vụ PTOps khởi động lần đầu và trở thành conductor chính, công tắc tổng của scheduler được bật, và uptime của process nhỏ hơn 5 phút (tránh chạy khi failover sang một conductor dự phòng).

**Rất được khuyến nghị** bạn cũng nên thêm [Max Queue Limit](limits.md#max-queue-limit) vào event khi dùng trigger này. Điều này đảm bảo rằng nếu không có target server nào khả dụng (rất phổ biến khi khởi động lần đầu), job sẽ được đưa vào hàng đợi cho đến khi ít nhất một server trong tập target khả dụng. Sau đó nó sẽ tự động ra hàng đợi và chạy đúng.

Tham số:

| Tên | Loại | Bắt buộc | Mô tả |
|------|------|----------|-------------|
| `params` | Object | Tuỳ chọn | Tuỳ chọn bao gồm override tham số cho event / plugin. |
| `tags` | Array | Tuỳ chọn | Tuỳ chọn bao gồm một tập [Tag.id](data.md#tag-id) để thêm vào job khi nó khởi chạy. |

Đây là trigger trường hợp đặc biệt, và do đó nó bỏ qua các bổ sung như [Catch-Up](#catch-up), [Range](#range), [Blackout](#blackout), [Delay](#delay), [Precision](#precision), [Quiet](#quiet), và [Plugin](#plugin).

Lưu ý rằng trigger startup sẽ không kích hoạt nếu dịch vụ PTOps bị khởi động lại thủ công do hành động upgrade, restart hoặc shutdown do người dùng yêu cầu từ UI.

### Catch-Up

Chế độ catch-up là một tính năng tuỳ chọn được thiết kế để đảm bảo một event luôn chạy đúng lịch, ngay cả khi một số tình huống nhất định xảy ra có thể tạm thời ngăn việc thực thi của nó. Điều này có thể bao gồm các tình huống như:

- Tắt dịch vụ PTOps
- Tạm dừng scheduler
- Tắt scheduler hoặc trigger catch-up trong event
- Tắt toàn bộ event

Khi chế độ catch-up được bật, PTOps sẽ thực thi **tất cả** các job đã lên lịch cho event, bao gồm bất kỳ lần bị bỏ lỡ nào lẽ ra phải chạy trong "thời gian gián đoạn".

Bên trong, chế độ catch-up duy trì một "con trỏ" (cursor) trong database PTOps cho mỗi event, chỉ đến một timestamp cụ thể. Bất cứ khi nào một job chạy theo lịch, điều sau xảy ra:

- Con trỏ tiến đến phút kế tiếp, dừng lại ở thời điểm hiện tại.
- Trong trường hợp có khoảng trống thời gian, con trỏ tiến từng phút một cho đến thời điểm hiện tại, để đảm bảo không có job đã lên lịch nào bị bỏ lỡ.

Bạn có thể đặt thủ công thời gian con trỏ bằng cách chỉnh sửa tuỳ chọn trigger catch-up cho một event. Dùng điều này để chạy lại các event trong quá khứ, hoặc nhảy đến thời điểm hiện tại.

Chế độ Catch-Up **sẽ không** chạy lại các job đã thất bại hoặc bị abort. Đây là chủ ý thiết kế. Nếu bạn muốn job thất bại tự động chạy lại, đặt [Max Retry Limit](limits.md#max-retry-limit).

Tham số: Không có

Lưu ý:

- Áp dụng cho trigger schedule/interval trên cùng event.
- Ở mỗi tick của scheduler, con trỏ của event tiến từng phút một, đánh giá lịch cho mỗi phút cho đến thời điểm hiện tại.
- Gián đoạn dài có thể tạo ra một lượng lớn job trễ tồn đọng; đảm bảo event và hạ tầng của bạn có thể xử lý các đợt catch-up dồn dập.
- Time Machine: Trong UI bạn có thể đặt một timestamp con trỏ tuỳ chỉnh để chạy lại một khoảng thời gian lịch sử (đặt con trỏ trong quá khứ) hoặc bỏ qua lượng tồn đọng (đặt con trỏ gần "hiện tại").

### Every Nth

Every Nth là một công cụ bổ nghĩa lịch trình tùy chọn sẽ bỏ qua một số job được lập lịch dựa trên một mẫu lặp lại mà bạn chỉ định, ví dụ: "mỗi lần khác" (every other), "mỗi lần thứ 3", v.v. Bạn chỉ định số lượng job cần bỏ qua, và bạn cũng có thể reset bộ đếm nội bộ được sử dụng để lưu trạng thái (nhờ đó bạn có thể kiểm soát thời điểm job tiếp theo chạy).

Một ví dụ điển hình cho việc sử dụng tính năng này là nếu bạn muốn lập lịch cho một job chạy vào một thời điểm cụ thể sau mỗi N ngày, bất kể là thứ mấy trong tuần hay ngày nào trong tháng. Ví dụ: nếu bạn muốn chạy một job sau mỗi 14 ngày (chính xác hai tuần một lần), bạn chỉ cần thiết lập job chạy hàng ngày và đặt Nth thành 14 (chạy mỗi job thứ 14). Ngoài ra, bạn có thể thiết lập job chạy hàng tuần vào một ngày cụ thể trong tuần, nhưng đặt Nth thành 2, điều này cũng mang lại kết quả tương tự.

Ví dụ:

```json
{
  "type": "nth",
  "enabled": "true",
  "every": 2
}
```

Lưu ý rằng các lượt chạy thủ công và các lượt chạy được gọi qua API sẽ bỏ qua công cụ bổ nghĩa này, vì nó chỉ quản lý các job được lập lịch.

### Range

Chỉ cho phép khởi chạy giữa một thời điểm bắt đầu và kết thúc tuyệt đối. Hoạt động như một ràng buộc bổ sung áp dụng cho các trigger tự động khác (schedule/interval/plugin/single).

Tham số:

| Tên | Loại | Bắt buộc | Mô tả |
|------|------|----------|-------------|
| `start` | Number | Có | Unix timestamp bắt đầu (giây). |
| `end` | Number | Có | Unix timestamp kết thúc (giây). Phải ≥ `start`. |

Lưu ý:

- Hữu ích cho các chiến dịch, phát hành theo giai đoạn (rollout), hoặc thử nghiệm tạm thời.
- Áp dụng cho trigger tự động (schedule/interval/plugin/single). Không ảnh hưởng đến lần chạy thủ công.

Ví dụ:

```json
{
  "type": "range",
  "enabled": true,
  "start": 1754607600,
  "end": 1754694000
}
```

### Blackout

Ngược lại với range: không cho phép khởi chạy giữa một thời điểm bắt đầu và kết thúc tuyệt đối.

Tham số:

| Tên | Loại | Bắt buộc | Mô tả |
|------|------|----------|-------------|
| `start` | Number | Có | Unix timestamp bắt đầu (giây). |
| `end` | Number | Có | Unix timestamp kết thúc (giây). Phải ≥ `start`. |

Lưu ý:

- Hữu ích cho các khoảng thời gian bảo trì hoặc ngày lễ.
- Áp dụng cho trigger tự động (schedule/interval/plugin/single). Không ảnh hưởng đến lần chạy thủ công.

Ví dụ:

```json
{
  "type": "blackout",
  "enabled": true,
  "start": 1754694000,
  "end": 1754780400
}
```

### Delay

Thêm một khoảng trì hoãn khởi chạy vào tất cả các job được scheduler khởi chạy cho event. Không ảnh hưởng đến lần chạy thủ công/API. Loại trừ lẫn nhau với `interval` và `precision`. Như một "bổ sung", tuỳ chọn này chỉ có hiệu lực khi job được khởi chạy từ trigger scheduler (tức là không được khởi chạy thủ công qua UI hoặc API).

Tham số:

| Tên | Loại | Bắt buộc | Mô tả |
|------|------|----------|-------------|
| `duration` | Number | Có | Trì hoãn tính bằng giây thêm vào thời gian bắt đầu đã lên lịch. Phải ≥ 1. |

Ví dụ (trì hoãn tất cả lần khởi chạy 2 phút):

```json
{
  "type": "delay",
  "enabled": true,
  "duration": 120
}
```

### Precision

Khởi chạy trong phút đã lên lịch tại các mốc giây cụ thể. Bổ sung cho các trigger tự động khác để đạt được lần bắt đầu dưới phút (sub-minute). Loại trừ lẫn nhau với `interval` và `delay`. Như một "bổ sung", tuỳ chọn này chỉ có hiệu lực khi job được khởi chạy từ trigger scheduler (tức là không được khởi chạy thủ công qua UI hoặc API).

Tham số:

| Tên | Loại | Bắt buộc | Mô tả |
|------|------|----------|-------------|
| `seconds` | Array(Number) | Có | Một hoặc nhiều mốc giây trong khoảng 0-59. |

Lưu ý:

- Áp dụng cho các phút đã lên lịch (và cho các phút interval khi tương thích). Nhiều job có thể được khởi chạy trong một phút tại các giây được liệt kê.
- Không ảnh hưởng đến lần chạy thủ công/API.

Ví dụ (khởi chạy vào :05, :20, :35, :50 trong mỗi phút khớp):

```json
{
  "type": "precision",
  "enabled": true,
  "seconds": [5, 20, 35, 50]
}
```

### Quiet

Bổ sung "Quiet" cho phép bạn cấu hình job chạy âm thầm (tức là hoàn toàn vô hình với UI), và cũng tuỳ chọn ephemeral (để tự xoá sau khi hoàn tất). Như một "bổ sung", tuỳ chọn này chỉ có hiệu lực khi job được khởi chạy từ trigger scheduler (tức là không được khởi chạy thủ công qua UI hoặc API). Mỗi chế độ quiet có thể được bật hoặc tắt riêng:

| Tên | Loại | Bắt buộc | Mô tả |
|------|------|----------|-------------|
| `invisible` | Boolean | Có | Job sắp tới, trong hàng đợi và đang chạy sẽ hoàn toàn bị ẩn khỏi UI. |
| `ephemeral` | Boolean | Có | Tự xoá job sau khi hoàn tất (không lưu trữ vĩnh viễn). |

Một vài lưu ý về hành vi:

- Chế độ invisible ảnh hưởng đến job đang chạy, job trong hàng đợi, cũng như job sắp tới, trong UI.
	- Bạn vẫn có thể truy cập job invisible đang chạy qua API (tức là [get_job](api.md#get_job), [get_jobs](api.md#get_jobs)).
	- Ngay khi job hoàn tất, nó sẽ trở nên hiển thị trở lại (trừ khi `ephemeral` cũng được đặt).
- Chế độ ephemeral sẽ tự động tắt nếu job tạo ra file output, hoặc có code khác 0 (tức là job thất bại).
- Cả hai chế độ invisible và ephemeral được truyền xuống các sub-job con nếu được đặt trên một workflow.

### Plugin

Sử dụng một [Trigger Plugin](plugins.md#trigger-plugins) tuỳ chỉnh để quyết định có khởi chạy job hay không. Plugin chạy với các tham số đã cấu hình và trả về quyết định khởi chạy/không khởi chạy cho mỗi lần chạy đã lên lịch. Đây là một "bổ sung" nên cần được dùng cùng với một trigger schedule chuẩn.

Tham số:

| Tên | Loại | Bắt buộc | Mô tả |
|------|------|----------|-------------|
| `plugin_id` | String | Có | ID của một Plugin đã cấu hình thuộc loại `scheduler`. |
| `params` | Object | Tuỳ chọn | Các key/value cấu hình do plugin định nghĩa. |
| `timezone` | String | Tuỳ chọn | Context timezone cung cấp cho plugin (mặc định là timezone server). |

Lưu ý:

- Ở mức tổng quan, PTOps gọi plugin một lần cho mỗi lần chạy đã lên lịch kèm context, và khởi chạy job nếu plugin chỉ định như vậy. Plugin cũng có thể yêu cầu một khoảng trì hoãn cho mỗi lần khởi chạy và có thể cung cấp dữ liệu/file input cho job. Xem [Plugins](plugins.md) để biết chi tiết.
- Đối với các trường hợp sử dụng như theo dõi file mới, đặt một trigger schedule chạy mỗi phút, để Plugin được kiểm tra thường xuyên nhất có thể.

Ví dụ:

```json
{
  "type": "plugin",
  "enabled": true,
  "plugin_id": "queue_gate",
  "params": { "queue": "nightly", "threshold": 100 },
  "timezone": "UTC"
}
```

Xem [Trigger Plugins](plugins.md#trigger-plugins) để biết thêm chi tiết.

## Lưu Ý Về Workflow

Workflow dùng cùng hệ thống trigger event. Khi một workflow đã lên lịch khởi chạy, scheduler ghi lại trigger nào đã khởi động lần chạy để workflow có thể tham chiếu nội bộ.

## Validation

Khi bạn lưu hoặc chạy một event, PTOps validate các trigger:

- Loại và tham số bắt buộc phải có mặt và định dạng đúng.
- Range: `start` ≤ `end` khi áp dụng. Blackout yêu cầu cả hai.
- Danh sách schedule phải chứa số trong phạm vi hợp lệ; `days` có thể bao gồm −1...−7 để biểu thị ngày ngược trong tháng.
- Các quy tắc duy nhất và loại trừ lẫn nhau khi enable được thực thi (xem Quy Tắc Kết Hợp).

Để biết chi tiết đầy đủ về cấu trúc dữ liệu, xem [Trigger](data.md#trigger) và [Trigger.type](data.md#trigger-type).
