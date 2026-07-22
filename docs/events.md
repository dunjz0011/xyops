# Events

## Tổng Quan

Event là thành phần cốt lõi của PTOps. Một event mô tả cái gì sẽ chạy (một Plugin cùng tham số), chạy ở đâu (một hoặc nhiều server/group đích), khi nào chạy (Trigger), và cách kiểm soát/phản ứng với các lần chạy (Limit và Action). Mỗi lần một event "chạy" nó sẽ khởi tạo một job. Job có đầy đủ trạng thái lifecycle, log, metrics, limit, và action.

## Điểm Chính

- Một event là một cấu hình đã lưu để khởi tạo job. Nó có `id`, `title`, `category`, `plugin`, `params`, và tuỳ chọn `fields`, `tags`, `targets`, `algo`, `triggers`, `limits`, `actions`.
- Khi một trigger kích hoạt (schedule, interval, single-shot, plugin, hoặc manual), scheduler tạo một job từ event và khởi chạy nó trên một server đích được chọn.
- Giá trị mặc định của category tự động áp dụng: action và limit định nghĩa trong category được gộp vào job cùng với những gì định nghĩa trên event. Giá trị mặc định "universal" của hệ thống cũng có thể áp dụng.
- Job chạy code do Event Plugin cung cấp trên server được chọn, truyền log về UI, cập nhật metrics, và tuân theo limit/action đã cấu hình.
- Workflow là một loại event đặc biệt khởi chạy một đồ thị các node; chúng dùng một pseudo-plugin workflow đặc biệt. Xem [Workflows](workflows.md).

## Tạo và Sửa Event

Bạn có thể tạo và sửa event trên trang Events của giao diện hoặc qua API. Những thứ tối thiểu bạn thường cần:

- `title`: Tên thân thiện, hiển thị trên giao diện.
- `category`: Kiểm soát quyền truy cập và cung cấp action/limit mặc định. Xem [Categories](categories.md).
- `plugin`: Event Plugin chạy code của job (không cần với event workflow). Xem [Event Plugins](plugins.md#event-plugins).
- `targets`: Một hoặc nhiều server và/hoặc group nơi job có thể chạy.
- `algo`: Thuật toán chọn server khi có nhiều target khả dụng (mặc định là random).
- `params`: Tham số plugin được truyền vào job của bạn. Tham số bị khoá (locked) có thể được admin hoặc category ép buộc.
- `fields`: Tham số tuỳ chọn do người dùng định nghĩa, được hỏi khi khởi chạy thủ công, sau đó gộp vào params.
- `tags`: Nhãn giúp tìm kiếm và lọc lịch sử job. Xem [Tags](tags.md).
- `triggers`: Một hoặc nhiều mục xác định thời gian chạy và quy tắc. Xem [Triggers](triggers.md).
- `limits`: Giới hạn tài nguyên tự áp đặt mà job phải tuân theo. Xem [Limits](limits.md).
- `actions`: Hành vi thông báo/chuỗi liên kết tuỳ chọn cho từng event. Xem [Actions](actions.md).

## Cách Event Chạy

Chạy một event tạo ra một job. Đây là lifecycle từ trigger đến thực thi:

1. **Trigger kích hoạt**
	- Scheduler đánh giá tất cả trigger của event mỗi phút một lần (có thể tuỳ chọn độ chính xác cấp giây) và phát sinh lần chạy khi điều kiện khớp.
	- Chạy thủ công từ UI/API cũng được tính là một lần khởi chạy.
2. **Đối tượng Job được tạo**
	- Job bắt đầu như một bản sao của event cùng context của trigger và bất kỳ override từ user/API.
	- Nó được gán một `job.id` duy nhất, và `job.event` được đặt bằng ID của event.
	- Action/limit định nghĩa trong category và giá trị mặc định hệ thống được gộp vào.
3. **Tham số được xử lý**
	- `event.params` và bất kỳ `fields` được hỏi sẽ được gộp lại và có thể dùng `{{ macros }}` để giải quyết theo context của job. Xem [Parameter Macro Expansion](#parameter-macro-expansion) để biết chi tiết và ví dụ.
4. **Chọn target**
	- Hệ thống thu thập các server ứng viên từ targets (server và/hoặc group), lọc ra server đang bật và online, và tuỳ chọn loại bỏ server đang bị chặn bởi alert đang hoạt động.
	- Nếu không có server nào khả dụng, một limit `queue` (nếu được cấu hình) có thể đưa job vào hàng chờ; nếu không job sẽ hủy (abort) và có thể được đánh dấu là có thể retry.
	- Chi tiết về thuật toán chọn server xem bên dưới.
5. **Thực thi Plugin**
	- Khi một server được chọn, job sẽ được gửi đến agent xySat của server đó và Event Plugin chạy với tham số và môi trường cuối cùng.
	- Output truyền vào log của job; metrics CPU/memory/IO được lấy mẫu cho limit và lịch sử.
	- Xem [Event Plugins](plugins.md#event-plugins) để biết cấu trúc plugin và chi tiết thực thi.
6. **Limit và action**
	- Limit đang hoạt động (time, log size, CPU, memory, v.v.) được liên tục đánh giá.
	- Khi vượt ngưỡng, action đã cấu hình sẽ kích hoạt (email, web hook, tag, snapshot, abort, v.v.).
7. **Hoàn tất**
	- Khi kết thúc, action cuối cùng chạy (success/fail/progress/abort, cùng bất kỳ action dựa trên tag), và bản ghi job được lưu vào lịch sử để tìm kiếm và phân tích.

## Trigger

Trigger định nghĩa khi nào job được phép khởi chạy, và các modifier tuỳ chọn. Các mẫu phổ biến:

- `manual`: Cho phép chạy theo yêu cầu qua UI/API. Nếu bỏ qua hoặc tắt, chạy thủ công sẽ bị từ chối.
- `schedule`: Mảng kiểu cron của năm/tháng/ngày/ngày trong tuần/giờ/phút với timezone tuỳ chọn.
- `interval`: Chạy mỗi N phút; loại trừ với precision/delay.
- `single`: Chạy một lần vào một ngày/giờ cụ thể.
- `plugin`: Scheduler Plugin quyết định khi nào chạy; hữu ích cho tín hiệu bên ngoài.
- Modifier: `catchup`, `nth`, `range`, `blackout`, `delay`, `precision` cung cấp cửa sổ thời gian, khoá, và hành vi dưới cấp phút.

Xem đầy đủ danh sách trigger và quy tắc kết hợp: [Triggers](triggers.md).

## Chọn Server

Danh sách `targets` có thể chứa ID server và/hoặc ID group. Tại thời điểm khởi chạy, PTOps:

- Mở rộng group thành các server thành viên và loại bỏ trùng lặp trong danh sách.
- Lọc ra các server hiện đang bật và online.
- Tuỳ chọn loại bỏ các server đang bị chặn bởi alert đang hoạt động (ví dụ maintenance hoặc giới hạn công suất).
- Tuỳ chọn áp dụng một [Target Expression](#target-expressions) để lọc tiếp danh sách (xem bên dưới).
- Nếu tập kết quả trống, và có limit `queue`, job có thể vào hàng chờ riêng của event lên đến kích cỡ đã cấu hình; nếu không nó sẽ abort với cờ retry-ok.

Việc chọn giữa các ứng viên còn lại được kiểm soát bởi `algo`:

- `random`: Chọn ngẫu nhiên trong số ứng viên.
- `round_robin`: Xoay vòng qua các ứng viên theo thứ tự, giữ vị trí giữa các lần chạy.
- `least_cpu`: Chọn server báo cáo tải CPU thấp nhất.
- `least_mem`: Chọn server báo cáo bộ nhớ đang dùng thấp nhất.
- `prefer_first_natural` / `prefer_last_natural`: Ưu tiên đầu/cuối theo thứ tự tự nhiên trong danh sách [Event.targets](data.md#event-targets).
- `prefer_first` / `prefer_last`: Ưu tiên đầu/cuối theo thứ tự sắp xếp label hoặc hostname để đảm bảo tính ổn định.
- `monitor:_ID_`: Chọn server có giá trị hiện tại nhỏ nhất của một monitor cụ thể.

ID server được chọn được lưu trên job dưới dạng `server` và các group mà server đó thuộc về được sao chép vào `groups` để phục vụ phân tích.

### Target Expression

Event có thể bao gồm một "target expression" tuỳ chọn để lọc tiếp tập server ứng viên chạy job. Expression được áp dụng cho mỗi server trong tập khớp được tạo ra từ danh sách [Event.targets](data.md#event-targets), và nếu nó trả về `false`, server đó bị loại khỏi nhóm ứng viên.

Expression nên theo [PTOps Expression Format](xyexp.md), và context là chính đối tượng [Server](data.md#server) (nên bạn có thể tham chiếu trực tiếp mọi thuộc tính trong đó). Ví dụ:

```js
info.arch == "arm64" && info.cpu.cores >= 4
```

Điều này sẽ giảm số server ứng viên chỉ còn những server có kiến trúc ARM64, và 4 hoặc nhiều CPU core hơn, sử dụng sub-object [Server.info](data.md#server-info).

Một trường hợp sử dụng phổ biến của tính năng này là áp dụng target expression lên các thuộc tính trong object [Server User Data](servers.md#user-data). Ví dụ:

```js
userData.foo == "bar"
```

### Trọng Số Job Tuỳ Chỉnh

Bạn có thể đặt "trọng số job" tuỳ chọn cho mỗi event, dùng khi chọn server để chạy job. Tính năng này được thiết kế để bổ trợ cho [Max Jobs Per Server](servers.md#max-jobs-per-server), và cho phép bạn giới hạn số job có thể chạy trên các server cụ thể dựa trên trọng số của chúng.

Ví dụ, nếu bạn có một job đặc biệt "nặng", như một script chuyển đổi video dùng ffmpeg. Bạn có thể đặt trọng số cao như `8`, và điều này khiến job được coi như chiếm 8 "chỗ" khi tính khả dụng của server và cài đặt "max jobs" của server.

Nếu một job mới sẽ vượt quá cài đặt "max jobs" trên một server, server đó sẽ bị loại khỏi xem xét (giống như nếu nó không khả dụng hoặc offline). Nếu "max jobs" của một server nhỏ hơn trọng số job, nó sẽ không bao giờ được chọn cho job đó.

Theo mặc định tất cả job có trọng số là `1`. Để đặt trọng số job cao hơn, sửa limit [Max Concurrent Jobs](limits.md#max-concurrent-jobs) trên event (hoặc gắn một [Limit Node](workflows.md#limit-nodes) trong workflow của bạn), và trong dialog bạn sẽ thấy một trường mới "Server Job Weight". Lưu ý trọng số này **chỉ** dùng cho việc chọn server, và không ảnh hưởng đến giới hạn đồng thời tối đa của riêng job đó.

### Nhắm Mục Tiêu Ưu Tiên Theo Group

Thuật toán event [prefer_first_natural](data.md#event-algo) có thể dùng kết hợp với tính năng [Max Jobs Per Server](servers.md#max-jobs-per-server) để triển khai hiệu quả việc nhắm mục tiêu ưu tiên theo group. Khi một event nhắm vào nhiều group, và `prefer_first_natural` được chọn, group server đầu tiên sẽ được ưu tiên, *cho đến khi* không thể (ví dụ do giới hạn max jobs per server), và chỉ khi đó group thứ hai mới được xem xét.

Nhớ rằng cài đặt max jobs trên server sẽ hiệu quả "loại bỏ" server khỏi xem xét khi nó đã đầy (hoặc không thể chứa job mới dựa trên [trọng số](#custom-job-weight) của nó). Với `prefer_first_natural`, hệ thống sẽ chọn server tiếp theo trong group, cho đến khi tất cả server đó đã đầy (nghĩa là không khả dụng cho job tiếp theo), và chỉ khi đó các group bổ sung mới được xem xét.

Lưu ý bạn có thể kiểm soát thứ tự sắp xếp group trong danh sách [Event.targets](data.md#event-targets) bằng cách vào trang "Groups" và kéo group của bạn để sắp xếp lại. Group ở trên cao hơn trong danh sách sẽ xuất hiện trước trong danh sách target của event.

### Xếp Hàng Job Ưu Tiên

Job có một cờ tuỳ chọn [Job.priority](data.md#job-priority). Khi được đặt là `true` và [xếp hàng](limits.md#max-queue-limit) được bật trên event, job ưu tiên sẽ hiệu quả "vượt hàng", và được chèn ngay vào đầu, để nó được xử lý trước tất cả các job không ưu tiên khác.

Cờ ưu tiên có thể được đặt khi một job được khởi chạy thủ công, hoặc qua API. Với chạy thủ công trên UI, dialog cấu hình job sẽ hiện một checkbox mới "High Priority", nếu [xếp hàng](limits.md#max-queue-limit) được bật trên event. Với các lệnh gọi API, khi dùng API [run_event](api.md#run_event), chỉ cần bao gồm thuộc tính `priority` và đặt là `true`.

Khi nhiều job ưu tiên được xếp hàng cho một event, những job chờ lâu nhất sẽ được xử lý trước (nghĩa là FIFO). Sau khi tất cả job ưu tiên được xử lý, các job không ưu tiên mới được lấy ra khỏi hàng (cũng FIFO).

Lưu ý bạn không thể đặt cờ priority qua trigger [Magic Link](triggers.md#magic-link) (theo thiết kế).

## Plugin

Mỗi event không phải workflow tham chiếu đến một Event Plugin qua `plugin`, định nghĩa cách thực thi job: lệnh/script, ID user/group, kill signal, và định nghĩa tham số. Scheduler sao chép các giá trị tham số mặc định còn thiếu từ đặc tả plugin tại thời điểm khởi chạy, và ép buộc các tham số bị khoá/bắt buộc cho người dùng không phải admin.

- **Tham số**: `params` được truyền cho plugin. Thuộc tính khoá/bắt buộc có thể được đặt bởi admin hoặc category. `fields` tuỳ chọn thu thập lúc chạy thủ công được gộp vào `params`.
- **Môi trường**: Job kế thừa `job_env` đã cấu hình cộng với bất kỳ override `env` riêng của event. Ngoài ra, tất cả tham số Plugin cũng được truyền như biến môi trường.
- **Input**: Job có thể bao gồm `input.data` có cấu trúc và `input.files` được upload khi khởi chạy từ UI/API. Action như "Bucket Fetch" cũng có thể điền input trước khi code của bạn chạy.

Xem [Event Plugins](plugins.md#event-plugins) để biết tham số plugin, và chi tiết lifecycle.

### Mở Rộng Macro Tham Số

Tất cả giá trị chuỗi trong object `params` của một event hỗ trợ mở rộng macro nội tuyến dùng cú pháp `{{ ... }}`. Điều này bao gồm giá trị tham số Plugin thông thường, cộng với các đường dẫn tiện lợi sau:

| Cú pháp Macro | Mô tả |
|---------------|-------|
| `{{ params.NAME }}` | Giá trị tham số event hoặc user field có tên `NAME`. |
| `{{ workflow.params.NAME }}` | Một tham số khởi chạy workflow, cho sub-job bên trong workflow. |
| `{{ parent.job }}` | ID job cha, khi job này được khởi chạy bởi job khác. |
| `{{ data.NAME }}` | Bí danh tiện lợi cho `input.data.NAME`, nếu input data được cung cấp. |
| `{{ files[0].filename }}` | Bí danh tiện lợi cho `input.files[0].filename`, nếu input files được cung cấp. |

Đây chỉ là danh sách nhanh các đường dẫn phổ biến. Để biết đầy đủ các thuộc tính khả dụng, xem tài liệu tham chiếu object [Job](data.md#job).

Mẫu phổ biến nhất là tham chiếu một tham số từ tham số khác. Ví dụ, nếu event của bạn có một user field tên `region`, một tham số text khác có thể bao gồm nó như thế này:

```text
Deploying to {{ params.region }}
```

Input data từ workflow, khởi chạy API, và action cũng có thể được chèn trực tiếp. Đường dẫn đầy đủ là `input.data`, nhưng PTOps cũng expose `data` ở cấp cao nhất để tiện lợi:

```text
Process account {{ data.account_id }} from {{ data.source }}
```

Tương tự, input files khả dụng ở cả `input.files` và `files`:

```text
First uploaded file: {{ files[0].filename }}
```

Macro dùng cùng cú pháp expression kiểu JavaScript và hàm hỗ trợ được mô tả trong [PTOps Expression Format](xyexp.md), nên các expression đơn giản cũng được cho phép:

```text
Retry attempt {{ retry_count + 1 }} for {{ params.target }}
```

## Limit

Limit giới hạn job đang chạy và tuỳ chọn kích hoạt action. Các loại phổ biến bao gồm:

- `time`: Thời gian chạy tối đa (wall clock).
- `log`: Kích cỡ output tối đa (bytes).
- `cpu` và `mem`: Ngưỡng sử dụng liên tục với thời gian ân hạn (grace period).
- `queue`: Cho phép xếp hàng khi không có target khả dụng, tối đa N job mỗi event.

Limit có thể áp dụng tag, gửi email/web hook, tạo snapshot, và abort job. Limit của event kết hợp với giá trị mặc định của category và limit universal. Xem docs/limits.md để biết tài liệu tham chiếu đầy đủ và cách dùng UI.

## Action

Action chạy tại các giai đoạn và điều kiện lifecycle cụ thể của job: `start`, `progress`, `success`, `warning`, `critical`, `abort`, `complete`, và các trigger dựa trên tag (`tag:xyz`). Action có thể:

- Gửi email đến user và/hoặc địa chỉ tuỳ chỉnh.
- Kích hoạt web hook với payload job phong phú.
- Chạy event khác (chaining).
- Gọi một [Action Plugin](plugins.md#action-plugins).
- Lưu hoặc lấy file/data của job đến/từ [Storage Buckets](buckets.md).
- Tạo [Tickets](tickets.md), đăng vào [Channels](channels.md), chụp [Server Snapshots](snapshots.md), và nhiều hơn nữa.

Action của event kết hợp với giá trị mặc định của category và action universal. Xem [Actions](actions.md) để biết tất cả loại action và cấu hình.

## Chạy Thủ Công và Prompt

Để cho phép chạy theo yêu cầu từ UI hoặc API, thêm một trigger `manual` đã bật vào event. Khi khởi chạy thủ công:

- Bất kỳ `fields` định nghĩa trên event sẽ được hiển thị dưới dạng form UI, và giá trị của chúng được gộp vào `params`.
- UI/API có thể gắn file đã upload; những file này trở thành `input.files`. JSON tuỳ ý có thể được cung cấp dưới dạng `input.data` khi test.
- Người dùng không phải admin phải thoả mãn bất kỳ tham số bị khoá/bắt buộc định nghĩa bởi plugin hoặc event fields; hệ thống ép buộc những điều này và áp dụng giá trị mặc định.

Để chạy một event theo cách lập trình, xem [API](api.md) để biết endpoint chạy và override tham số.

## Quyền Hạn và Kế Thừa

- Bạn phải có quyền để tạo/sửa event và để chạy job. Hệ thống ép buộc quyền category và target cho mọi tác vụ bao gồm truy cập lịch sử nếu áp dụng.
- Action và limit của category được thêm vào event tại thời điểm chạy. Action/limit universal cũng có thể áp dụng dựa trên cấu hình hệ thống.

## Workflow

Event workflow là các đồ thị "multi-event" đặc biệt với các node được kết nối. Trigger trên một event workflow định nghĩa điểm vào của đồ thị. Khi khởi chạy, workflow điều phối sub-job và action cho từng node và kết nối. Xem [Workflows](workflows.md) để biết chi tiết đầy đủ.

## Đọc Thêm

- Schema Event: [Event](data.md#event)
- Trigger: [Triggers](triggers.md)
- Plugin: [Plugins](plugins.md)
- Limit: [Limits](limits.md)
- Action: [Actions](actions.md)
- API: [API](api.md)

## Ví Dụ

Đây là một ví dụ event đã rút gọn ở dạng JSON (xem [Data Structures](data.md#event) để biết phiên bản đầy đủ):

```json
{
  "id": "event100",
  "title": "Diverse heuristic complexity",
  "enabled": true,
  "category": "cat9",
  "plugin": "shellplug",
  "params": { "script": "#!/bin/bash\nsleep 30; echo HELLO;\n" },
  "targets": ["main"],
  "algo": "random",
  "triggers": [ { "type": "schedule", "enabled": true, "hours": [19], "minutes": [6] } ],
  "limits": [ { "type": "time", "enabled": true, "duration": 3600 } ],
  "actions": [ { "enabled": true, "condition": "error", "type": "email", "email": "admin@localhost" } ]
}
```

Khi thời điểm lên lịch đến, một job được tạo từ event này, một server được chọn dùng thuật toán `random` trong số các target đủ điều kiện, plugin `shellplug` chạy script, và bất kỳ limit/action nào áp dụng trong suốt lần chạy.
