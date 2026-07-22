# Buckets

## Tổng Quan

Storage Bucket cung cấp khả năng lưu trữ bền vững, có thể chia sẻ cho job và workflow. Một bucket có thể chứa dữ liệu JSON có cấu trúc và bất kỳ số lượng file nào. Job có thể fetch (lấy) từ bucket và store (lưu) vào bucket tại các điểm xác định trong vòng đời của nó, giúp output của một job trở thành input cho job khác, ngay cả khi các job đó không được kết nối trực tiếp trong một chuỗi.

## Điểm Chính

- Mục đích: Trao đổi dữ liệu/file bền vững giữa các job và workflow.
- Loại nội dung: Đối tượng dữ liệu JSON và bộ sưu tập file (không hoặc nhiều file).
- Truy cập: Quản lý qua UI và API; kiểm soát bởi privilege.
- Tích hợp với job: Fetch lúc job bắt đầu; store lúc job hoàn thành dựa trên điều kiện của action.
- Link trực tiếp: File trong bucket có thể tải xuống qua URL.

Xem cấu trúc dữ liệu [Bucket](data.md#bucket) và [Bucket API](api.md#buckets) để biết chi tiết kỹ thuật đầy đủ.

## Khi Nào Nên Dùng

- Chuyển giao giữa job: Truyền artifact từ build sang deploy, hoặc output từ chuẩn bị dữ liệu sang phân tích.
- Workflow: Chia sẻ trạng thái và file giữa các node workflow, ngay cả những node không có kết nối trực tiếp.
- Checkpointing: Lưu trữ kết quả trung gian để phục vụ retry hoặc kiểm tra thủ công.
- Trạng thái chia sẻ: Duy trì các document JSON nhỏ mà nhiều job có thể đọc/cập nhật qua thời gian.

## Quản Lý Bucket Trên UI

Người dùng có privilege phù hợp có thể tạo, sửa và xoá bucket từ phần Buckets trên UI.

- Tạo: Cung cấp tiêu đề, icon/notes tuỳ chọn; ID được tự sinh.
- Sửa dữ liệu: Bucket có một panel "Data" dạng JSON bạn có thể sửa trực tiếp. Đây là dữ liệu tự do do người dùng định nghĩa.
- Upload file: Kéo-thả hoặc chọn nhiều file. File đã tồn tại có tên đã chuẩn hoá giống nhau sẽ bị thay thế.
- Xoá file: Xoá từng file khỏi danh sách; việc xoá là vĩnh viễn.
- Tải file: Nhấn vào một file để tải xuống qua URL trực tiếp. Link dùng đường dẫn `files/bucket/...`.

Tên file được chuẩn hoá khi upload (chuyển thành chữ thường; ký tự không phải chữ/số ngoại trừ dấu gạch ngang và chấm sẽ đổi thành dấu gạch dưới). Upload tuân theo các giới hạn đã cấu hình (kích thước/số lượng/loại file tối đa) qua `client.bucket_upload_settings` và được thực thi ở phía server. Xem [Configuration](config.md) để biết chi tiết.

### Privilege Bắt Buộc

- `create_buckets`: Tạo bucket mới.
- `edit_buckets`: Sửa metadata, dữ liệu JSON, và file của bucket.
- `delete_buckets`: Xoá bucket và toàn bộ dữ liệu/file chứa trong đó.

Xem [Privileges](privileges.md#buckets) để biết chi tiết cụ thể. Việc liệt kê và lấy thông tin thường chỉ cần session hợp lệ hoặc API Key.

## Sử Dụng Bucket Trong Job

Bucket tích hợp với job qua hai loại action: [Fetch Bucket](actions.md#fetch-bucket) và [Store Bucket](actions.md#store-bucket). Bạn gắn các action này vào job với điều kiện kiểm soát khi nào chúng chạy.

### Fetch Lúc Job Bắt Đầu

Sử dụng [Fetch Bucket](actions.md#fetch-bucket) với điều kiện `start` để lấy nội dung bucket vào context input của job trước khi khởi chạy:

- **Dữ liệu**: Được shallow-merge vào `input.data` của job. Tránh trùng key hoặc namespace các key của bạn một cách chủ động.
- **File**: Các file được chọn sẽ được thêm vào danh sách file input của job và được staged vào thư mục temp của job trên server remote trước khi Plugin bắt đầu.

Ví dụ (JSON):

```json
{
  "enabled": true,
  "condition": "start",
  "type": "fetch",
  "bucket_id": "bme4wi6pg35",
  "bucket_sync": "data_and_files",
  "bucket_glob": "*.csv"
}
```

### Store Lúc Hoàn Thành

Sử dụng [Store Bucket](actions.md#store-bucket) với một điều kiện hoàn thành (ví dụ: `success`, `error`, `complete`) để lưu lại output của job:

- **Dữ liệu**: Job có thể xuất ra output data, được ghi vào bucket khi `bucket_sync` bao gồm `data`.
- **File**: File output của job có thể được lọc bằng `bucket_glob` và lưu vào bucket khi `bucket_sync` bao gồm `files`.

Ví dụ (JSON):

```json
{
  "enabled": true,
  "condition": "success",
  "type": "store",
  "bucket_id": "bme4wi6pg35",
  "bucket_sync": "data_and_files",
  "bucket_glob": "*.mp4"
}
```

Tham số dùng cho cả hai action:

- `bucket_id`: [Bucket.id](data.md#bucket-id) đích.
- `bucket_sync`: Một trong `data`, `files`, hoặc `data_and_files` để kiểm soát cái gì được fetch/store.
- `bucket_glob`: Pattern glob tuỳ chọn để lọc file nào được bao gồm (mặc định `*`).

Xem [Store Bucket](actions.md#store-bucket) và [Fetch Bucket](actions.md#fetch-bucket) để biết đầy đủ ngữ nghĩa và ghi chú của action.

**Chú ý:** Job phải chủ động xuất ra dữ liệu và/hoặc file trước khi action Store Bucket có thể nhìn thấy chúng. Xem [Output Data](plugins.md#output-data) và [Output Files](plugins.md#output-files) để biết chi tiết.

## Workflow Và Bucket

Bucket thường được dùng trong workflow để truyền artifact và trạng thái giữa các node mà không cần kết nối trực tiếp giữa chúng. Gắn action Fetch/Store vào các node workflow liên quan:

- Node phía trên (upstream) lưu output vào một bucket chia sẻ khi `success`.
- Node phía dưới (downstream) fetch từ cùng bucket đó lúc `start` để nhận dữ liệu/file như thể được cung cấp từ một node trước đó.

Mẫu này hữu ích cho các thiết kế fan-out/fan-in, các nhánh tuỳ chọn, và trạng thái chia sẻ tồn tại lâu giữa các job định kỳ.

## Tải File Qua URL

Mỗi file trong bucket có một `path` (ví dụ: `files/bucket/<bucket_id>/<hash>/<filename>`). Thêm base URL của app và một dấu `/` ở đầu để tải trực tiếp từ browser hoặc qua HTTP client. Ví dụ:

```
GET https://your.xyops.example.com/files/bucket/bme4wi6pg35/bdY8zZ9nKynfFUb4xH6fA/report.csv
```

Các URL này có xác thực tích hợp sẵn và "ổn định" (tức là permalink) ngay cả khi file bị thay thế trong bucket (tuy nhiên, không đúng nếu chúng bị xoá và sau đó được thêm lại).

## Truy Cập Bằng Chương Trình

Sử dụng các API [get_bucket](api.md#get_bucket), [write_bucket_data](api.md#write_bucket_data) và [upload_bucket_files](api.md#upload_bucket_files), bạn có thể đọc và ghi dữ liệu/file bucket bằng chương trình tại bất kỳ thời điểm nào, bao gồm cả trong lúc job đang chạy. Cách thiết lập như sau:

- Đầu tiên, tạo một storage bucket, và lưu lại [Bucket.id](data.md#bucket-id) mới.
- Tiếp theo, tạo một [API Key](api.md#api-keys), và cấp cho nó privilege [edit_buckets](privileges.md#edit_buckets). Lưu lại secret của API key khi được nhắc.
- Sau đó, tạo một [Secret Vault](secrets.md), và thêm API Key cùng Bucket ID của bạn dưới dạng biến (ví dụ `XYOPS_API_KEY` và `XYOPS_BUCKET_ID`).
- Gán secret vault vào Event, Category hoặc Plugin của bạn (phạm vi tuỳ bạn chọn).

Khi job của bạn chạy, bạn sẽ có quyền truy cập vào các biến secret, và cũng có một biến đặc biệt gọi là [Job.base_url](data.md#job-base_url) (còn có sẵn dưới dạng biến môi trường `JOB_BASE_URL`). Sử dụng các biến này, bạn có thể ghi dữ liệu bucket như sau:

```sh
#!/bin/sh
JSON_PAYLOAD='{ "data": { "foo": "bar", "number": 1234 } }'
API_URL="$JOB_BASE_URL/api/app/write_bucket_data/v1?id=$XYOPS_BUCKET_ID"

curl -sS "$API_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $XYOPS_API_KEY" \
  -d "$JSON_PAYLOAD" >/dev/null
```

Và đọc lại như sau:

```sh
#!/bin/sh
API_URL="$JOB_BASE_URL/api/app/get_bucket/v1?id=$XYOPS_BUCKET_ID"
RESPONSE=$(curl -sS -H "X-API-Key: $XYOPS_API_KEY" "$API_URL")

echo "Response: $RESPONSE"
```

API [write_bucket_data](api.md#write_bucket_data) được thiết kế bền vững, và có thể dễ dàng xử lý khi bị nhiều job gọi vào cùng lúc. Nó sử dụng locking để đảm bảo dữ liệu bucket không bị hỏng. Ngoài ra, mỗi request thực hiện một "shallow merge" khi ghi vào dữ liệu, nên nhiều "client" (event/workflow) có thể đọc/ghi các thuộc tính khác nhau trong cùng một bucket vào cùng thời điểm.

Tất nhiên, bạn có thể đạt được chức năng tương tự bằng action [Store Bucket](actions.md#store-bucket) và [Fetch Bucket](actions.md#fetch-bucket), nhưng theo cách này bạn có toàn quyền kiểm soát khi nào dữ liệu được đọc và ghi, và bạn không bị giới hạn ở lúc bắt đầu và hoàn thành của job.

## Lưu Ý

- **Namespace hoá**: Sử dụng key riêng biệt trong JSON của bucket để tránh trùng lặp shallow-merge với input của job.
- **Kỷ luật về kích thước**: Ưu tiên dùng bucket cho artifact có kích thước vừa phải; dataset lớn có thể xử lý tốt hơn qua external storage và tham chiếu bằng URL.
- **Dọn dẹp**: Xem xét các thực hành quản lý vòng đời (ví dụ: thay thế/xoay vòng file) để giữ bucket gọn gàng và trong giới hạn.

## Xem Thêm

- Cấu trúc dữ liệu: [Bucket](data.md#bucket)
- API: [Buckets](api.md#buckets)
- Action: [Store Bucket](actions.md#store-bucket), [Fetch Bucket](actions.md#fetch-bucket)
- Privilege: [Buckets](privileges.md#buckets)
