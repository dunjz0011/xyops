# Limits

## Tổng Quan

Limit là các hạn chế tự áp đặt mà bạn có thể đặt trên event của mình, để kiểm soát việc sử dụng tài nguyên trong khi job chạy, cũng như chỉ định các tuỳ chọn như số lần retry tối đa, hoặc số job tối đa được phép vào hàng đợi. Limit có thể được định nghĩa ở nhiều cấp độ khác nhau, bao gồm trực tiếp trên event, gắn vào workflow như node, kế thừa từ category, hoặc kế thừa từ file cấu hình toàn hệ thống của bạn (còn gọi là limit "universal").

Trong một số trường hợp khi nhiều limit cùng loại xuất hiện cho một job, chỉ một limit sẽ được áp dụng. Điều này đúng với [Max Concurrent Jobs](#max-concurrent-jobs), [Max Retry Limit](#max-retry-limit), [Max Queue Limit](#max-queue-limit), và [Max File Limit](#max-file-limit). Đối với các limit này PTOps sẽ chọn limit đầu tiên được enable của loại được chọn, với các limit được sắp trước theo thứ tự này:

- Limit định nghĩa trên event *(ưu tiên cao nhất)*
- Node limit của workflow
- Limit kế thừa từ category
- Limit kế thừa universal *(ưu tiên thấp nhất)*

Đối với các loại limit khác, ví dụ [Max Run Time](#max-run-time), [Max Output Size](#max-output-size), [Max CPU Limit](#max-cpu-limit) và [Max Memory Limit](#max-memory-limit), khi có nhiều limit cùng lúc, tất cả đều được áp dụng. Ví dụ, bạn có thể muốn phát cảnh báo khi job dùng 500MB memory, nhưng abort job nếu memory sử dụng đạt 1GB. Bạn có thể đạt được điều này bằng cách thêm hai limit riêng biệt, và cả hai sẽ được tuân theo.

Tài liệu này giải thích cách limit hoạt động, nơi chúng được định nghĩa, thứ tự ưu tiên và kế thừa, và chi tiết từng loại limit với tham số và ví dụ.

## Điểm Chính

- Limit áp dụng cho cả event và workflow. Workflow trong ngữ cảnh này chỉ là event và hỗ trợ tất cả loại limit.
- Category có thể định nghĩa limit mặc định tự động kế thừa cho tất cả event trong category. Event có thể override giá trị mặc định của category.
- Giá trị mặc định universal có thể được đặt trong config chính và tự động kế thừa cho tất cả job/workflow.
- Limit tài nguyên cho job đang chạy (time, log size, memory, CPU) có thể kích hoạt các action bổ sung như gắn tag, gửi email, gọi web hook, chụp snapshot, và tuỳ chọn abort job.

Ví dụ tối thiểu (JSON):

```json
{
	"enabled": true,
	"type": "time",
	"duration": 3600
}
```

## Nơi Limit Được Định Nghĩa

- **Trình chỉnh sửa Event / Workflow**: Thêm limit trực tiếp vào một job hoặc workflow cụ thể.
- **Trình chỉnh sửa Category**: Thêm limit mặc định mà tất cả event trong category kế thừa.
- **Configuration**: Thêm giá trị mặc định universal trong `job_universal_limits` cho event job hoặc chỉ workflow.

## Phạm Vi, Kế Thừa, và Thứ Tự Ưu Tiên

- Cả ba nguồn đều có thể đóng góp limit: event/workflow, category, và universal.
- Thứ tự ưu tiên theo nguồn khi khởi chạy job:
	- Limit event/workflow trước (ưu tiên cao nhất)
	- Limit category kế tiếp
	- Limit universal cuối cùng
- PTOps tham khảo limit khớp `type` đầu tiên cho các kiểm tra tại thời điểm khởi chạy như Max Concurrent Jobs (`job`) và Max Queue (`queue`).
- Đối với kiểm tra tài nguyên khi đang chạy (`time`, `log`, `mem`, `cpu`), có thể có nhiều limit tồn tại, và tất cả đều áp dụng, và có thể thực hiện các action riêng.

## Đối Tượng Limit

Tất cả object [Limit](data.md#limit) bao gồm các thuộc tính chung này:

| Thuộc tính | Loại | Mô tả |
|---------|------|-------------|
| `enabled` | Boolean | Bật (`true`) hoặc tắt (`false`) limit. |
| `type` | String | Áp dụng loại limit nào. Xem Loại Limit dưới đây. |

Các thuộc tính bổ sung được yêu cầu tuỳ theo loại limit.

## Các Loại Limit

Các loại limit sau đây có sẵn. Mỗi phần dưới đây mô tả hành vi, tham số, và có kèm ví dụ.

### Max Run Time

Áp đặt trần mềm hoặc cứng cho tổng thời gian chạy job. Khi vượt quá, các action tuỳ chọn có thể được thực hiện (tag, email, web hook, snapshot) và job có thể bị abort.

Tham số:

| Tên | Loại | Bắt buộc | Mô tả |
|------|------|----------|-------------|
| `type` | String | Có | Đặt là `time` cho max run time. |
| `duration` | Number | Có | Thời gian chạy tối đa tính bằng giây. |
| `tags` | Array(String) | Tuỳ chọn | Gắn các [Tag.id](data.md#tag-id) này khi vượt quá. |
| `users` | Array(String) | Tuỳ chọn | Gửi email đến các [User.username](data.md#user-username) này. |
| `email` | String | Tuỳ chọn | Danh sách địa chỉ email bổ sung, phân tách bằng dấu phẩy. |
| `web_hook` | String | Tuỳ chọn | Gọi [WebHook.id](data.md#webhook-id) này khi vượt quá. |
| `text` | String | Tuỳ chọn | Văn bản tuỳ chỉnh thêm vào message web hook. |
| `snapshot` | Boolean | Tuỳ chọn | Chụp snapshot server khi vượt quá. |
| `abort` | Boolean | Tuỳ chọn | Abort job khi vượt quá. |

Ví dụ:

```json
{
	"enabled": true,
	"type": "time",
	"duration": 3600,
	"tags": ["limited"],
	"users": ["oncall"],
	"email": "ops@example.com",
	"web_hook": "slack_ops",
	"text": "Runaway protection triggered",
	"snapshot": true,
	"abort": true
}
```

### Max Concurrent Jobs

Giới hạn số job cùng loại event/workflow có thể chạy đồng thời. Nếu đạt trần, PTOps có thể vào hàng đợi job nếu limit `queue` cho phép; nếu không, job sẽ bị abort.

Tham số:

| Tên | Loại | Bắt buộc | Mô tả |
|------|------|----------|-------------|
| `type` | String | Có | Đặt là `job` cho max concurrent jobs. |
| `amount` | Number | Có | Số job active đồng thời tối đa cho event/workflow. |
| `weight` | Number | Không | Trọng số job tuỳ chọn, dùng trong tính toán target server. |

Lưu ý:

- Phạm vi cho workflow khớp với event của workflow; đối với job node workflow ad-hoc, phạm vi hàng đợi bao gồm node ID.
- Hoạt động cùng với `queue`: không có hàng đợi, job sẽ bị abort khi đạt limit.
- `weight` tuỳ chọn được dùng để xác định server nào có thể chạy job. Xem [Max Jobs Per Server](servers.md#max-jobs-per-server).

Ví dụ:

```json
{
	"enabled": true,
	"type": "job",
	"amount": 2
}
```

### Max Output Size

Giới hạn kích thước output/log của job (bytes). Khi vượt quá, các action tuỳ chọn có thể được thực hiện và job có thể bị abort.

Tham số:

| Tên | Loại | Bắt buộc | Mô tả |
|------|------|----------|-------------|
| `type` | String | Có | Đặt là `log` cho max output size. |
| `amount` | Number | Có | Số byte tối đa của nội dung output/log. |
| `tags` | Array(String) | Tuỳ chọn | Gắn các tag này khi vượt quá. |
| `users` | Array(String) | Tuỳ chọn | Gửi email đến các user này. |
| `email` | String | Tuỳ chọn | Danh sách địa chỉ email bổ sung, phân tách bằng dấu phẩy. |
| `web_hook` | String | Tuỳ chọn | Gọi web hook này. |
| `text` | String | Tuỳ chọn | Văn bản tuỳ chỉnh thêm vào message web hook. |
| `snapshot` | Boolean | Tuỳ chọn | Chụp snapshot server khi vượt quá. |
| `abort` | Boolean | Tuỳ chọn | Abort job khi vượt quá. |

Ví dụ:

```json
{
	"enabled": true,
	"type": "log",
	"amount": 10485760,
	"users": ["sre"],
	"abort": true
}
```

### Max Memory Limit

Giới hạn tổng lượng memory sử dụng cho job (bao gồm cả process con). Limit chỉ kích hoạt nếu mức sử dụng vượt ngưỡng liên tục trong khoảng thời gian duy trì (sustain). Các action tuỳ chọn có thể được thực hiện và job có thể bị abort.

Tham số:

| Tên | Loại | Bắt buộc | Mô tả |
|------|------|----------|-------------|
| `type` | String | Có | Đặt là `mem` cho max memory limit. |
| `amount` | Number | Có | Memory tối đa tính bằng byte. |
| `duration` | Number | Có | Thời gian duy trì (giây) vượt limit trước khi kích hoạt. |
| `tags` | Array(String) | Tuỳ chọn | Gắn các tag này khi vượt quá. |
| `users` | Array(String) | Tuỳ chọn | Gửi email đến các user này. |
| `email` | String | Tuỳ chọn | Danh sách địa chỉ email bổ sung, phân tách bằng dấu phẩy. |
| `web_hook` | String | Tuỳ chọn | Gọi web hook này. |
| `text` | String | Tuỳ chọn | Văn bản tuỳ chỉnh thêm vào message web hook. |
| `snapshot` | Boolean | Tuỳ chọn | Chụp snapshot server khi vượt quá. |
| `abort` | Boolean | Tuỳ chọn | Abort job khi vượt quá. |

Ví dụ:

```json
{
	"enabled": true,
	"type": "mem",
	"amount": 1073741824,
	"duration": 30,
	"tags": ["memoryhot"],
	"snapshot": true,
	"abort": true
}
```

### Max CPU Limit

Giới hạn mức sử dụng CPU cho job (bao gồm cả process con). Limit chỉ kích hoạt nếu CPU vượt ngưỡng liên tục trong khoảng thời gian duy trì. Các action tuỳ chọn có thể được thực hiện và job có thể bị abort.

Tham số:

| Tên | Loại | Bắt buộc | Mô tả |
|------|------|----------|-------------|
| `type` | String | Có | Đặt là `cpu` cho max CPU limit. |
| `amount` | Number | Có | Phần trăm CPU, trong đó `100` bằng một core sử dụng hết công suất. |
| `duration` | Number | Có | Thời gian duy trì (giây) vượt limit trước khi kích hoạt. |
| `tags` | Array(String) | Tuỳ chọn | Gắn các tag này khi vượt quá. |
| `users` | Array(String) | Tuỳ chọn | Gửi email đến các user này. |
| `email` | String | Tuỳ chọn | Danh sách địa chỉ email bổ sung, phân tách bằng dấu phẩy. |
| `web_hook` | String | Tuỳ chọn | Gọi web hook này. |
| `text` | String | Tuỳ chọn | Văn bản tuỳ chỉnh thêm vào message web hook. |
| `snapshot` | Boolean | Tuỳ chọn | Chụp snapshot server khi vượt quá. |
| `abort` | Boolean | Tuỳ chọn | Abort job khi vượt quá. |

Ví dụ:

```json
{
	"enabled": true,
	"type": "cpu",
	"amount": 250,
	"duration": 20,
	"users": ["oncall"],
	"web_hook": "slack_ops",
	"abort": true
}
```

### Max Retry Limit

Kiểm soát số lần retry được thử cho job thất bại, và tuỳ chọn thời gian chờ giữa các lần retry. Ở mỗi lần retry, PTOps sẽ nhân bản context của job, tăng `retry_count`, và tuỳ chọn trì hoãn trước khi chạy lại.

Tham số:

| Tên | Loại | Bắt buộc | Mô tả |
|------|------|----------|-------------|
| `type` | String | Có | Đặt là `retry` cho max retry limit. |
| `amount` | Number | Có | Số lần retry tối đa được thử. `0` tắt retry. |
| `duration` | Number | Tuỳ chọn | Thời gian trì hoãn (giây) giữa các lần retry. |

Ví dụ:

```json
{
	"enabled": true,
	"type": "retry",
	"amount": 3,
	"duration": 60
}
```

### Max Queue Limit

Giới hạn số job được phép chờ trong hàng đợi khi concurrency hoặc khả năng đáp ứng của server ngăn việc bắt đầu ngay. Không có max queue limit, job sẽ bị abort khi không thể bắt đầu do limit `job` hoặc chọn server.

Tham số:

| Tên | Loại | Bắt buộc | Mô tả |
|------|------|----------|-------------|
| `type` | String | Có | Đặt là `queue` cho max queue limit. |
| `amount` | Number | Có | Số job trong hàng đợi tối đa được phép. `0` tắt hàng đợi. |

Ví dụ:

```json
{
	"enabled": true,
	"type": "queue",
	"amount": 25
}
```

> [!IMPORTANT]
> Nếu bạn thêm max queue limit với amount khác 0, bạn cũng phải thêm limit [Max Concurrent Jobs](#max-concurrent-jobs).

### Max File Limit

Limit mềm dùng để cắt bớt (prune) các file đến (từ input job) trước khi khởi chạy. Nó có thể giới hạn số lượng file, tổng kích thước kết hợp, và hạn chế loại file theo phần mở rộng. Limit này không bao giờ abort job; nó chỉ cắt bớt và ghi log những gì đã bị loại bỏ.

Tham số:

| Tên | Loại | Bắt buộc | Mô tả |
|------|------|----------|-------------|
| `type` | String | Có | Đặt là `file` cho max file limit. |
| `amount` | Number | Có | Số file input tối đa được phép. `0` nghĩa là **không** file nào được phép. |
| `size` | Number | Tuỳ chọn | Tổng kích thước kết hợp tối đa (byte) cho tất cả file. |
| `accept` | String | Tuỳ chọn | Danh sách phần mở rộng file được phép, phân tách bằng dấu phẩy (bao gồm dấu chấm đầu, không phân biệt hoa thường), ví dụ `.json,.csv`. |

Ví dụ:

```json
{
	"enabled": true,
	"type": "file",
	"amount": 100,
	"size": 52428800,
	"accept": ".json,.csv,.tsv"
}
```

### Max Daily Limit

Limit này sẽ âm thầm ngăn việc khởi chạy job bổ sung nếu một số lượng điều kiện (condition count) cụ thể theo ngày đã đạt cho event. Ví dụ, để giới hạn tổng số job được phép mỗi ngày cho event, đặt condition là `complete` (kích hoạt cho mọi hoàn tất job bất kể kết quả). Để hãm phanh khẩn cấp cho lỗi nghiêm trọng (critical error), đặt condition là `critical` rồi đặt amount tương ứng.

Tham số:

| Tên | Loại | Bắt buộc | Mô tả |
|------|------|----------|-------------|
| `type` | String | Có | Đặt là `day` cho max daily limit. |
| `condition` | String | Có | [Condition](data.md#action-condition) job nào cần theo dõi trong daily stats (ví dụ `complete`). |
| `amount` | Number | Có | Số lượng condition tối đa được phép mỗi ngày. |

Ví dụ:

```json
{
	"enabled": true,
	"type": "day",
	"condition": "complete",
	"amount": 100
}
```

Các metrics theo ngày có thể được reset trên tab "System" trong UI.

Lưu ý rằng chạy job thủ công (tức là bởi user hoặc API key) sẽ bỏ qua kiểm tra này.

## Universal Limits

Đặt giá trị mặc định universal trong config server dưới [job_universal_limits](config.md#job_universal_limits). Bạn có thể định nghĩa các array riêng cho `default` (event thường) và `workflow` limit. Chúng được thêm vào sau limit category và event, nên cài đặt event/workflow sẽ được ưu tiên.

Ví dụ:

```json
"job_universal_limits": {
	"default": [
		{ "enabled": true, "type": "retry", "amount": 2, "duration": 30 },
		{ "enabled": true, "type": "queue", "amount": 100 }
	],
	"workflow": []
}
```

## Lưu Ý và Hành Vi

- Thực thi tại thời điểm khởi chạy: Limit `job`, `queue`, và `file` được đánh giá trước khi khởi chạy. `job`/`queue` xác định job chạy ngay, vào hàng đợi, hay abort. `file` cắt bớt input.
- Thực thi khi đang chạy: `time`, `log`, `mem`, `cpu` được kiểm tra trong khi job chạy. `mem` và `cpu` yêu cầu vượt ngưỡng liên tục trong `duration` của chúng trước khi kích hoạt.
- Action được kích hoạt: Đối với `time`, `log`, `mem`, `cpu`, khi vượt quá PTOps có thể gắn tag, gửi email, gọi web hook (kèm text bổ sung tuỳ chọn), chụp snapshot, và abort job. Tất cả action được ghi lại trong Activity log của job kèm chi tiết.
- Nhiều limit tương tự: Nếu nhiều nguồn định nghĩa cùng loại, định nghĩa event/workflow được ưu tiên cho kiểm tra tại thời điểm khởi chạy.
- Hàng đợi và phạm vi: Hàng đợi theo từng event. Đối với các lần chạy node workflow ad-hoc, phạm vi hàng đợi bao gồm định danh node để tránh tranh chấp lẫn nhau giữa các node không liên quan. Hàng đợi được dùng cả khi concurrency `job` đã đầy và khi hiện không có server phù hợp nào khả dụng.

Xem thêm: [Limit](data.md#limit) và [Limit Types](data.md#limit-type) để biết định nghĩa cấu trúc dữ liệu chuẩn.
