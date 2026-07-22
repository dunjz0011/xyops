# Tickets

## Tổng Quan

Tickets trong PTOps cung cấp cách nhẹ nhàng, tích hợp để theo dõi issue, release, thay đổi, sự cố, và bất kỳ công việc vận hành nào cần audit trail, comment, file, và automation. Tickets tồn tại song song với job, alert, server, và workflow, và có thể vừa phản ứng với hệ thống (tự tạo từ job hoặc alert) vừa điều khiển hệ thống (chạy event/job trực tiếp từ ticket).

## Thuộc Tính

Tickets là các bản ghi JSON đơn giản với vài trường cốt lõi và tùy chọn. Schema đầy đủ nằm ở [Ticket](data.md#ticket). Các thuộc tính chính được tóm tắt ở đây.

- `subject`: Tóm tắt/tiêu đề ngắn. HTML bị loại bỏ.
- `body`: Nội dung Markdown cho ticket. Hữu ích cho runbook, context từ job/alert, và checklist.
- `type`: Một trong issue, feature, release, change, maintenance, question, other. Chỉ ảnh hưởng đến hiển thị; chọn loại phù hợp nhất với workflow của bạn.
- `status`: Một trong draft, open, closed.
  - `draft`: Chặn toàn bộ email thông báo. Dùng khi soạn nháp mà không muốn báo cho ai.
  - `open`: Trạng thái ticket đang hoạt động bình thường.
  - `closed`: Đã hoàn thành/giải quyết. Việc đóng ticket được ghi vào lịch sử thay đổi và có thể tìm kiếm.
- `assignees`: Mảng username chịu trách nhiệm về ticket. Nhận email cập nhật và thông báo quá hạn.
- `cc`: Mảng username cũng nhận email cập nhật (không nhận thông báo quá hạn).
- `notify`: Mảng địa chỉ email tùy chỉnh nhận cập nhật (không nhận thông báo quá hạn). Hữu ích cho danh sách nhóm như `ops-team@company.com`.
- `category`: [Category.id](data.md#category-id) tùy chọn. Tự động đặt khi ticket được tạo từ job để khớp category của job.
- `tags`: Mảng [Tag.id](data.md#tag-id). Tự động đặt từ tag của job gốc khi tự tạo.
- `server`: [Server.id](data.md#server-id) tùy chọn. Tự động đặt khi tạo từ job/alert có tham chiếu server.
- `due`: Ngày hạn tùy chọn (Unix giây). Sau khi qua ngày này, thông báo quá hạn hàng ngày sẽ được gửi email cho assignee.
- `files`: Mảng file được tải lên gắn vào ticket. File được liệt kê trên trang ticket và truyền làm input cho job chạy từ các event của ticket.
- `events`: Danh sách các event stub có thể chạy job từ ticket. Mỗi event có thể override targets, thuật toán chọn, tags, và giá trị tham số mặc định.
- `changes`: Lịch sử thay đổi và comment. Bao gồm các mục "change" có cấu trúc và mục "comment".

## Tạo Ticket

Bạn có thể tạo ticket thủ công, qua API, và tự động qua action của job/alert.

### Thủ Công

- Nhấn "New Ticket" trên sidebar.
- Điền subject, body (Markdown), type, status, category, server, assignees, cc, notify, tags, và due.
- Gắn file nếu cần (các file này sẽ hiện dưới Ticket Files và được truyền vào job chạy từ ticket).
- Lưu dưới dạng Draft để chặn thông báo cho đến khi sẵn sàng.

### API

Dùng [create_ticket](api.md#create_ticket) để tạo ticket bằng chương trình. Bạn có thể gửi JSON hoặc multipart/form-data (để tải file lên). Xem [API](api.md) để biết chi tiết và ví dụ đầy đủ.

- JSON: `POST /api/app/create_ticket/v1` với các trường ticket.
- Tải file: Dùng `multipart/form-data` với trường `json` chứa chuỗi JSON của ticket, cộng thêm một hoặc nhiều trường file để gắn.

Các API liên quan:

- [update_ticket](api.md#update_ticket): Cập nhật shallow-merge; server tự phát hiện và ghi lại thay đổi.
- [add_ticket_change](api.md#add_ticket_change) và [update_ticket_change](api.md#update_ticket_change): Thêm/sửa/xóa comment hoặc mục thay đổi.
- [upload_user_ticket_files](api.md#upload_user_ticket_files): Tải lên và gắn file vào ticket.
- [delete_ticket_file](api.md#delete_ticket_file): Xóa file đã gắn.
- [delete_ticket](api.md#delete_ticket): Xóa ticket vĩnh viễn.
- [search_tickets](api.md#search_tickets): Tìm kiếm với pagination và sắp xếp; hỗ trợ chế độ compact cho grid.

### Mẫu Ticket Mới (New Ticket Template)

Bạn có thể đặt giá trị mặc định cho ticket mới bằng cấu hình [client.new_ticket_template](config.md#client-new_ticket_template). Điều này hữu ích khi team muốn mọi ticket mới bắt đầu với metadata chung, ngày hạn chuẩn, hoặc danh sách thông báo toàn cục.

Mẫu này áp dụng cho ticket được tạo thủ công trên UI, và một phần của nó cũng được dùng bởi ticket tạo từ action của job và alert. Cụ thể, action tạo ticket kế thừa `cc`, `notify`, và `due` từ mẫu, trừ khi action tự cung cấp ngày hạn riêng.

Ví dụ đơn giản:

```json
"new_ticket_template": {
	"type": "issue",
	"status": "open",
	"assignees": ["oncall"],
	"cc": ["ops-manager"],
	"notify": ["ops-team@company.com"],
	"tags": ["production"],
	"due": "3 days"
}
```

Các tùy chọn phổ biến bao gồm:

- `assignees`: Danh sách user ID mặc định được assign cho ticket tạo thủ công.
- `cc`: Danh sách username PTOps mặc định nhận email cập nhật ticket.
- `notify`: Danh sách địa chỉ email tùy chỉnh mặc định nhận email cập nhật ticket.
- `tags`: Danh sách tag ID mặc định áp dụng cho ticket tạo thủ công.
- `type`: Loại ticket mặc định, ví dụ `issue`, `change`, hoặc `maintenance`.
- `status`: Trạng thái ticket mặc định, thường là `open` hoặc `draft`.
- `due`: Ngày hạn mặc định. Có thể là thời gian Unix epoch tuyệt đối, hoặc một khoảng thời gian tương đối như `"1 day"`, `"3 days"`, `"1 week"`, hoặc `"1d"`.

Ví dụ, để CC một ops manager vào mọi ticket mới, đặt:

```json
"new_ticket_template": {
	"cc": ["ops-manager"]
}
```

Để gửi tất cả email cập nhật ticket đến một mailing list ngoài, dùng `notify`:

```json
"new_ticket_template": {
	"notify": ["ops-team@company.com"]
}
```

Để mọi ticket mới có hạn ba ngày sau khi tạo, đặt:

```json
"new_ticket_template": {
	"due": "3 days"
}
```

Khi ticket có ngày hạn và vẫn mở sau ngày đó, PTOps sẽ gửi email nhắc quá hạn hàng ngày cho assignee của ticket. Email cập nhật ticket vẫn gửi cho assignee, người dùng trong `cc`, và địa chỉ email trong `notify`.

### Action Từ Job

Job có thể tạo ticket khi bắt đầu hoặc hoàn thành dựa trên kết quả hoặc tag. Thêm action "Create Ticket" vào một event, node workflow, hoặc qua mặc định của category/universal. Khi kích hoạt:

- Nội dung ticket được tự động tạo (mẫu: job) với context hữu ích (chi tiết job, hiệu năng, trích đoạn log, link).
- Category, tags, và trường server được tự động điền từ job khi phù hợp.
- Ticket có thể kế thừa giá trị mặc định `cc`, `notify`, và `due` từ `client.new_ticket_template`.
- Ticket mới được thêm vào job gốc để dễ truy vết.

Xem [Actions](actions.md) để biết cách cấu hình action.

### Action Từ Alert

Alert có thể tạo ticket khi alert kích hoạt (hoặc khi clear, nếu muốn). Thêm action alert "Create Ticket". Khi kích hoạt:

- Nội dung ticket được tự động tạo (mẫu: alert) với context server và alert, link đến alert và server, và tùy chọn tóm tắt các job đang hoạt động.
- Server được điền từ server kích hoạt; tags có thể đặt từ action.
- Ticket có thể kế thừa giá trị mặc định `cc`, `notify`, và `due` từ `client.new_ticket_template`.
- Ticket mới được thêm vào bản ghi alert invocation.

## Event Của Ticket

Event của ticket gắn các event (job) có thể chạy vào một ticket cùng override tham số tùy chọn. Chỉ cần nhấn nút "Add Event" và chọn một event.

Từ giao diện ticket bạn có thể chạy bất kỳ event đã gắn nào. Khi một job được khởi chạy từ ticket:

- Ticket được liên kết với job.
- Mọi file của ticket được truyền làm file input của job.
- File tạo ra từ các job trước đó chạy từ ticket cũng có thể được liên kết vào các lần chạy sau từ giao diện ticket.

Điều này khiến ticket trở thành một control plane mạnh mẽ cho CI/CD: tạo ticket cho một release, gắn các event deploy/test/rollback, tải artifact lên ticket, sau đó chạy job từ ticket và giữ toàn bộ lịch sử tập trung một nơi.

## File Của Ticket

- Gắn file trên UI hoặc tải lên qua API khi tạo ticket. File được lưu ở phía server và liệt kê trên ticket.
- File gắn vào ticket tự động được cung cấp cho job chạy từ các event của ticket.
- File có thể bị xóa khỏi ticket; việc xóa sẽ xóa cả bản ghi và đối tượng đã lưu.
- Thời hạn hết hiệu lực của file được kiểm soát bởi cấu hình (xem [file_expiration](config.md#file_expiration)). File hết hạn sẽ tự động được dọn dẹp.

## Comment và Thay Đổi

Bất kỳ người dùng có privilege [edit_tickets](privileges.md#edit_tickets) đều có thể thêm comment. Comment được lưu trong changes với type comment, và hỗ trợ định dạng Markdown.

- **Lịch sử thay đổi**: Việc sửa các trường chính (subject, status, type, category, server, assignees, due, cc, notify, tags) được ghi lại thành các mục thay đổi có cấu trúc. Ticket ở trạng thái draft không ghi lại thay đổi hoặc gửi thông báo.
- **Cập nhật email**: Assignee, người dùng trong cc, và email trong notify nhận email cập nhật theo lô (debounced) với tóm tắt các thay đổi và comment mới. Nếu nội dung body bị thay đổi, toàn bộ body sẽ được đưa vào bản cập nhật.
- **Thông báo quá hạn**: Sau khi qua ngày hạn, email nhắc quá hạn hàng ngày chỉ gửi cho assignee.

## Tìm Kiếm

Để thực hiện tìm kiếm ticket, nhấn vào các link preset tìm kiếm ticket trên sidebar, ví dụ "**All Tickets**". Sau đó, nhập một hoặc nhiều từ vào ô tìm kiếm, và nhấn enter (hoặc nhấn nút **Search**). Theo mặc định, subject và nội dung body của ticket sẽ được tìm kiếm. Tìm kiếm không phân biệt hoa thường. Nếu bạn nhập nhiều từ, tất cả phải xuất hiện trong ticket để được đưa vào kết quả tìm kiếm. Tuy nhiên, các từ không cần xuất hiện theo thứ tự. Ví dụ, xét truy vấn tìm kiếm này:

```
zip targeting
```

Truy vấn này sẽ tìm mọi ticket chứa cả hai từ (`zip` và `targeting`), nhưng chúng không cần đứng cạnh nhau. Mỗi từ có thể ở bất kỳ đâu trong ticket. Nếu bạn muốn khớp chính xác một cụm từ, hãy đặt nó trong "dấu ngoặc kép", như sau:

```
"zip targeting"
```

Truy vấn này chỉ hiển thị các message chứa *chính xác cụm từ* trong ngoặc kép, nghĩa là hai từ theo đúng thứ tự liên tiếp.

### Khớp Phủ Định (Negative Matches)

Bạn có thể bổ sung tìm kiếm để *loại trừ* một số từ hoặc cụm từ nhất định. Để làm điều này, thêm tiền tố gạch ngang (`-`) trước từ hoặc cụm từ phủ định. Ví dụ:

```
"zip targeting" -birds -cats -frogs
```

Truy vấn này sẽ tìm message chứa chính xác cụm từ "zip targeting", nhưng **không** chứa các từ `birds`, `cats` hoặc `frogs`. Lưu ý rằng từ phủ định chỉ có thể loại bớt khỏi kết quả tìm kiếm đã có, nên bạn cần bắt đầu với một số từ tìm kiếm dương (khớp thông thường).

### Khớp OR

Để tìm message chứa bất kỳ từ nào trong một tập từ (gọi là khớp "OR"), phân tách chúng bằng ký tự gạch đứng (`|`). Ví dụ:

```
campaign | memory | performance
```

Truy vấn này sẽ tìm ticket chứa **bất kỳ** từ nào được chỉ định. Lưu ý bạn không thể kết hợp tìm kiếm OR và AND trong cùng một truy vấn, nên chỉ có thể chọn một trong hai (trừ khi dùng [PxQL](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Indexer.md#pxql-queries)).

### Trường Tìm Kiếm

| Tên | Mô tả |
|------|-------|
| `subject` | Tìm kiếm trong trường chủ đề (subject) của ticket, ví dụ `subject:zip`. |
| `body` | Tìm kiếm toàn văn trong subject và body (mặc định khi không chỉ định trường). |
| `changes` | Tìm kiếm trong các thay đổi của ticket (bình luận và thay đổi trường), ví dụ `changes:rolled`. |
| `status` | Tìm kiếm theo trường status, ví dụ `status:open` hoặc `status:closed`. |
| `username` | Tìm kiếm theo người tạo ticket, ví dụ `username:admin`. |
| `assignees` | Tìm kiếm theo người được assign, ví dụ `assignees:admin`. |
| `cc` | Tìm kiếm theo danh sách CC, ví dụ `cc:admin`. |
| `type` | Tìm kiếm theo loại ticket, ví dụ `type:issue`. |
| `category` | Tìm kiếm theo category của ticket, ví dụ `category:prod`. |
| `tags` | Tìm kiếm theo tag của ticket, ví dụ `tags:important`. |
| `created` | Tìm kiếm theo ngày tạo ticket, ví dụ `created:>2020-02-01`. Đây là trường date hỗ trợ range. Xem [Simple Queries](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Indexer.md#simple-queries) để biết chi tiết. |
| `due` | Tìm kiếm theo ngày hết hạn của ticket, ví dụ `due:<today`. Đây là trường date hỗ trợ range. Xem [Simple Queries](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Indexer.md#simple-queries) để biết chi tiết. |
| `num` | Tìm kiếm theo số ticket, ví dụ `num:>5000`. Đây là trường số nguyên hỗ trợ range. Xem [Simple Queries](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Indexer.md#simple-queries) để biết chi tiết. |

Nếu bạn chỉ định nhiều trường, chúng được khớp theo logic AND. Tuy nhiên, bạn có thể chỉ định nhiều giá trị trong mỗi trường bằng ký tự gạch đứng (|) để khớp OR nội bộ. Ví dụ:

```
status:open|closed tags:important
```

Nếu bạn cần truy vấn phức tạp hơn, có thể dùng cú pháp [PxQL](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Indexer.md#pxql-queries), được hỗ trợ đầy đủ.

### Ví Dụ Tìm Kiếm

Dưới đây là một số ví dụ truy vấn tìm kiếm hữu ích:

| Tên | Truy vấn |
|------|-------|
| Tất cả ticket | `*` |
| Tất cả issue | `type:issue` |
| Tất cả không quan trọng | `num:>0 tags:-important` |
| Tất cả ticket quá hạn | `status:open due:<today` |
| Tạo trong khoảng ngày | `created:2021/02/01..2021/03/01` |
| Mở trong N ngày | `status:open created:<2021/02/01` |
| Mở và quan trọng | `status:open tags:important` |
| Khoảng số ticket | `num:>=5000 num:<6000` |
| Tìm chỉ trong subject | `subject:zip targeting` |
| Tìm chỉ trong bình luận | `changes:thank you` |

### Preset Tìm Kiếm

Khi đã có truy vấn tìm kiếm ưng ý, bạn có thể "lưu" nó vào tài khoản của mình dưới dạng preset tìm kiếm. Các preset đã lưu sẽ hiện trong sidebar dưới mục "**Ticket Searches**", để bạn quay lại chỉ với một cú click, và xem kết quả đã cập nhật.

Để lưu truy vấn tìm kiếm, nhấn nút "**Save Preset**", và đặt tên cho nó. Preset này sẽ được lưu vào tài khoản của bạn, nên nó vẫn còn đó dù bạn đăng xuất và đăng nhập lại sau, hoặc trên thiết bị khác.

Để sửa preset tìm kiếm, nhấn vào preset từ sidebar, thực hiện thay đổi mong muốn, rồi nhấn nút "**Edit Preset**", sau đó nhấn "**Save Changes**". Để xoá preset tìm kiếm, nhấn vào nó từ sidebar, rồi nhấn nút "**Delete Preset**".

### API Tìm Kiếm

Tìm kiếm bằng chương trình có sẵn qua API [search_tickets](api.md#search_tickets) (hỗ trợ phân trang và response dạng gọn).

## Gợi Ý và Mẫu Áp Dụng

- **Quản lý release**: Tạo một ticket Release và gắn các event deploy, test, và rollback. Upload artifact build của bạn lên ticket, rồi chạy deploy từ ticket. Artifact sẽ tự động chuyển vào job.
- **Xử lý sự cố (incident)**: Tự động tạo Issue khi alert kích hoạt kèm context server. Assign cho on-call, đặt ngày hết hạn để theo dõi tiếp, và ghi lại các bước khắc phục bằng bình luận. Đóng ticket khi đã xử lý xong.
- **Kiểm soát thay đổi (change control)**: Dùng ticket Change cho công việc đã có kế hoạch. Gắn các job kiểm tra (pre-check, post-check) và yêu cầu người assign thứ hai review.
- **Cửa sổ bảo trì (maintenance windows)**: Lên lịch ticket Maintenance với ngày hết hạn. Gắn job health-check để xác nhận trạng thái sau bảo trì.
- **Runbook**: Dùng body của ticket (Markdown) cho runbook và checklist. Liên kết đến job qua ticket event để có hành động lặp lại được.

## Privileges (Quyền)

- [create_tickets](privileges.md#create_tickets): Tạo ticket.
- [edit_tickets](privileges.md#edit_tickets): Sửa ticket, thêm bình luận, gắn/xoá file, chạy event của ticket.
- [delete_tickets](privileges.md#delete_tickets): Xoá ticket vĩnh viễn.

Xác thực chuẩn áp dụng cho việc sử dụng UI và API (session hoặc API Key). Xem [Privileges](privileges.md) và [API](api.md) để biết chi tiết.

## Xem Thêm

- Action có thể tự động tạo ticket: xem [Actions](actions.md)
- Mô hình dữ liệu và chi tiết trường của ticket: xem [Ticket](data.md#ticket)
- Endpoint API của ticket: xem [API](api.md#tickets) ([search_tickets](api.md#search_tickets), [create_ticket](api.md#create_ticket), [update_ticket](api.md#update_ticket), [add_ticket_change](api.md#add_ticket_change), [update_ticket_change](api.md#update_ticket_change), [delete_ticket_file](api.md#delete_ticket_file), [delete_ticket](api.md#delete_ticket))
