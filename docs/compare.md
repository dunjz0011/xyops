# So sánh sản phẩm

## n8n

Bản so sánh này tập trung vào **self-hosted n8n** so với **self-hosted PTOps**. Thông tin nghiên cứu được kiểm tra lần cuối vào **ngày 4 tháng 5 năm 2026**.

Phiên bản ngắn gọn: n8n là một sản phẩm tự động hóa workflow mạnh mẽ với danh mục tích hợp lớn, trình chỉnh sửa trực quan trau chuốt và các tính năng doanh nghiệp nghiêm túc. PTOps chồng lấp với n8n về tự động hóa workflow, lập lịch, webhook, plugin, secret, user, role và self-hosting. Nhưng PTOps không cố gắng chỉ trở thành một canvas tự động hóa. Đây là một nền tảng vận hành hoàn chỉnh kết hợp lập lịch job, điều phối workflow, monitor server, alert, snapshot, ticket, phản hồi sự cố và thực thi fleet-aware trong một hệ thống self-hosted duy nhất.

Sự khác biệt lớn nhất về bản quyền rất đơn giản: **PTOps bao gồm tất cả các tính năng của ứng dụng trong phiên bản mã nguồn mở miễn phí**. Các gói PTOps trả phí là các gói đăng ký hỗ trợ (support). Phiên bản Community Edition self-hosted của n8n là miễn phí, nhưng một số tính năng cộng tác, bảo mật, DevOps, khả năng quan sát (observability) và mở rộng quy mô (scaling) yêu cầu gói trả phí hoặc license key.

### Phân vị trí (Positioning)

| Lĩnh vực | PTOps | n8n |
|------|-------|-----|
| **Phân loại chính** | Nền tảng ops hoàn chỉnh: lập lịch, workflow, monitor, alert, ticket, phản hồi sự cố | Nền tảng tự động hóa workflow |
| **Self-hosting** | Có | Có |
| **Cloud hosting** | Không | Có |
| **Mô hình bản quyền** | Mã nguồn mở BSD-3-Clause, bao gồm tất cả tính năng của ứng dụng | Mô hình fair-code / source-available, với các tính năng trả phí yêu cầu Enterprise license |
| **Các gói trả phí** | Đăng ký chỉ dành cho hỗ trợ (support) | License tính năng và các cấp độ hỗ trợ |
| **Phù hợp nhất cho** | Đội ngũ ops muốn tự động hóa, nhận biết server, alert, ticket và runbook ở một nơi | Đội ngũ chủ yếu muốn tự động hóa workflow low-code và chất keo tích hợp |

### Mô hình tính năng

Gói miễn phí của PTOps bao gồm tất cả tính năng của ứng dụng, và các gói Professional và Enterprise trả phí chỉ bổ sung các dịch vụ hỗ trợ (support), chứ không thêm khả năng sản phẩm. Điều này rất quan trọng đối với các đội ngũ tự chạy self-host vì một lab thử nghiệm (staging), cluster production, cài đặt air-gapped và fork nội bộ đều có thể sử dụng cùng một bộ tính năng.

Mô hình self-hosted của n8n thì khác. n8n Community Edition là miễn phí và bao gồm sản phẩm workflow cốt lõi, nhưng tài liệu chính thức của n8n cho biết Community Edition không bao gồm các tính năng sau:

- **Custom Variables:** Các biến cấp instance có thể tái sử dụng cho các workflow.
- **Environments:** Chuyển đổi an toàn hơn giữa các thiết lập phát triển (development) và production.
- **External secrets:** Tích hợp với các kho lưu trữ secret bên ngoài như 1Password, AWS Secrets Manager, Azure Key Vault, GCP Secrets Manager và HashiCorp Vault.
- **External storage cho binary data:** Lưu trữ dữ liệu thực thi nhị phân bên ngoài kho lưu trữ mặc định/cục bộ.
- **Log streaming:** Gửi các event workflow, audit, queue, worker và node AI đến các công cụ logging bên ngoài.
- **Multi-main mode:** Khả năng dự phòng cao (high availability) của Enterprise / mở rộng quy mô control-plane theo chiều ngang.
- **Projects:** Tổ chức các workflow và credential vào các không gian chung của đội ngũ.
- **SSO:** SAML và LDAP không được bao gồm trong Community Edition.
- **Workflow và credential sharing:** Trong Community Edition, chỉ chủ sở hữu và người tạo instance mới có thể truy cập các workflow và credential.
- **Version control sử dụng Git:** Theo dõi thay đổi và thăng cấp dựa trên Git cho các workflow.

n8n cũng cung cấp một license key Community Edition đã đăng ký để mở khóa các thư mục, debug trong editor và dữ liệu thực thi tùy chỉnh. Gói này vẫn miễn phí nhưng yêu cầu đăng ký bằng địa chỉ email và kích hoạt license key.

### Các gói self-hosted trả phí

| Gói | PTOps | n8n |
|------|-------|-----|
| **Self-hosted miễn phí** | Tất cả tính năng của ứng dụng, hỗ trợ cộng đồng, mã nguồn mở BSD-3-Clause | Community Edition, tự động hóa workflow cốt lõi, một số tính năng bị giới hạn |
| **Self-hosted cấp trung** | Professional Support: $200/tháng, tất cả tính năng của ứng dụng, hệ thống ticket riêng tư, thời gian phản hồi phản hồi trong 24 giờ | Business: khoảng $783/tháng, thanh toán hàng năm, 40K lượt thực thi workflow production, 6 project chia sẻ, SSO/SAML/LDAP, environment, tùy chọn scaling, version control bằng Git, hỗ trợ qua diễn đàn |
| **Self-hosted Enterprise** | Enterprise Support: $1,000/tháng, tất cả tính năng của ứng dụng, thiết lập/hỗ trợ SSO, hỗ trợ cài đặt air-gapped, hệ thống ticket riêng tư, phản hồi trong 1 giờ, live chat | Enterprise: liên hệ bộ phận bán hàng, khối lượng thực thi tùy chỉnh, không giới hạn project chia sẻ, hơn 200 lượt thực thi đồng thời, lưu trữ insight lâu hơn, tích hợp kho secret bên ngoài, log streaming, kéo dài thời gian lưu trữ dữ liệu, hỗ trợ tận tình với SLA |

Còn một điểm khác biệt quan trọng khác về self-hosting: các tính năng n8n Business và Enterprise yêu cầu license key. Câu hỏi thường gặp về giá của n8n cho biết các license key trả phí self-hosted phải ping đến server bản quyền của n8n hàng ngày để duy trì hoạt động, và ping này bao gồm số lượng thực thi production. Các gói trả phí của PTOps là đăng ký hỗ trợ (support) và không bật hoặc tắt các tính năng trong ứng dụng.

### So sánh hỗ trợ

| Kênh hỗ trợ | PTOps | n8n |
|--------------|-------|-----|
| **Trợ giúp từ cộng đồng** | GitHub Discussions, GitHub Issues cho bug, Reddit, Discord, video, tài liệu | Diễn đàn cộng đồng |
| **Hỗ trợ trả phí không thuộc enterprise** | Gói Professional bao gồm hệ thống ticket riêng tư và thời gian phản hồi trong 24 giờ | Gói Business liệt kê hỗ trợ qua diễn đàn, và câu hỏi thường gặp về giá của n8n cho biết hỗ trợ tận tình chỉ được áp dụng trên gói Enterprise |
| **Hỗ trợ Enterprise** | Gói Enterprise bao gồm hệ thống ticket riêng tư, thời gian phản hồi trong 1 giờ, live chat, thiết lập/hỗ trợ SSO, và hỗ trợ cài đặt air-gapped | Enterprise liệt kê hỗ trợ tận tình với SLA, nhưng phạm vi hỗ trợ của n8n cũng nói rằng SLA mức độ nghiêm trọng được đảm bảo yêu cầu một hợp đồng hỗ trợ enterprise tận tình riêng biệt |
| **Giờ làm việc** | Thời gian phản hồi hỗ trợ của PTOps là trong giờ làm việc bình thường của múi giờ Thái Bình Dương Hoa Kỳ (US Pacific), không bao gồm cuối tuần và ngày lễ Hoa Kỳ | Tài liệu hỗ trợ của n8n định nghĩa giờ làm việc là từ thứ Hai đến thứ Sáu, 9:00 đến 17:00, với múi giờ dựa trên khu vực của khách hàng và không bao gồm các ngày lễ được quan sát tại Đức |

Đây là một trong những khác biệt thương mại rõ ràng hơn. PTOps cung cấp gói hỗ trợ Professional trả phí với giá $200/tháng bao gồm hệ thống ticket riêng tư và thời gian phản hồi được tuyên bố là 24 giờ. Gói Business self-hosted của n8n đắt hơn nhiều, được tính giá theo mức độ sử dụng, và vẫn hướng khách hàng đến hỗ trợ qua diễn đàn thay vì hỗ trợ tận tình.

### Phạm vi vận hành

| Khả năng | PTOps | n8n |
|------------|-------|-----|
| **Workflow trực quan** | Có, với các node trigger, event, job, action, limit, controller, và note | Có, với một canvas workflow trưởng thành và danh mục node lớn |
| **Lập lịch job** | Bộ lập lịch native với các tùy chọn thủ công, schedule, interval, single-shot, plugin, catch-up, blackout, precision, range, và delay | Trigger workflow, schedule, webhook, queue, và trigger tự động hóa |
| **Thực thi job fleet-aware** | Các server group native, target expression, thuật toán lựa chọn server, trọng số job, độ đồng thời trên mỗi server, và worker satellite | Các tùy chọn scaling self-hosted và queue worker, nhưng n8n không tập trung vào việc nhắm mục tiêu server-fleet |
| **Agent / runner từ xa** | xySat là một runner job từ xa và bộ thu thập metric không có dependency, được cài đặt bằng một lệnh như một dịch vụ trên Linux, Windows, macOS, hoặc Docker | Không có host agent tương đương. Các n8n queue worker và task runner chạy cùng với n8n hoặc các container worker; task runner cách ly việc thực thi Code node JavaScript/Python |
| **Monitor server** | Các monitor native, biểu đồ time-series, chế độ xem thời gian thực, plugin monitor tùy chỉnh, metric trên mỗi server và mỗi group | Execution insight và log streaming có sẵn trên các gói trả phí, nhưng n8n không phải là một nền tảng monitor server |
| **Alerting** | Định nghĩa alert native trên dữ liệu server trực tiếp, với các mẫu warm-up/cool-down, action fire/clear, kiểm soát giới hạn job và hủy job | Workflow lỗi, execution log, insight, và log streaming bên ngoài trên các gói trả phí |
| **Ticket sự cố** | Hệ thống ticket native liên kết với job, alert, file, bình luận, ngày hết hạn, và event có thể chạy được | Không phải là hệ thống ticket sự cố tích hợp sẵn |
| **Snapshot** | Snapshot server/group tại một thời điểm native cho ngữ cảnh pháp lý và action alert | Không thể so sánh vì không có hệ thống snapshot server native |
| **Secret** | Được mã hóa khi lưu trữ, gán cho event, category, plugin, và webhook, phân phối khi runtime dưới dạng biến môi trường hoặc template | Credential mã hóa tích hợp sẵn; các kho lưu trữ secret bên ngoài yêu cầu Enterprise self-hosted hoặc Enterprise Cloud |
| **SSO** | Được bao gồm trong ứng dụng mã nguồn mở, với các pattern SSO trusted-header và hướng dẫn thiết lập | SSO SAML/OIDC có sẵn trên các gói Business và Enterprise |
| **Role và permission** | Được bao gồm trong ứng dụng mã nguồn mở, với privilege, role, giới hạn category, và giới hạn group | RBAC có sẵn trên tất cả các gói ngoại trừ Community Edition, với các giới hạn project và role cụ thể theo gói |
| **Cài đặt air-gapped** | Được hỗ trợ bởi tài liệu, và hỗ trợ Enterprise bao gồm hỗ trợ cài đặt air-gapped | n8n hỗ trợ self-hosting, nhưng việc kích hoạt tính năng trả phí phụ thuộc vào khả năng kết nối tới server bản quyền trừ khi được thỏa thuận riêng |

### Trường hợp sử dụng hợp lý

Chọn **n8n** khi vấn đề chính là tích hợp các ứng dụng SaaS, API, công cụ AI và di chuyển dữ liệu trong một sản phẩm workflow trực quan, đặc biệt nếu đội ngũ đánh giá cao hệ sinh thái node của n8n và không cần monitor fleet tích hợp sẵn, alert, snapshot, hoặc ticket.

Chọn **PTOps** khi vấn đề chính là vận hành cơ sở hạ tầng và các workflow production cùng nhau: lập lịch job trên các server, chọn các target khỏe mạnh, xem metric trực tiếp, kích hoạt alert, đính kèm snapshot, mở ticket, và chạy các job khắc phục sự cố từ cùng một hệ thống.

### Điểm mấu chốt chính

- n8n là một công cụ tự động hóa mạnh mẽ, nhưng gói self-hosted miễn phí của nó không bao gồm một số tính năng cộng tác, bảo mật, khả năng quan sát và vận hành enterprise của đội ngũ.
- PTOps bao gồm tất cả tính năng của ứng dụng trong phiên bản mã nguồn mở, bao gồm SSO, role, workflow, monitor, alert, ticket, plugin, webhook, bucket, secret, snapshot, và lập lịch fleet-aware.
- n8n Business là một gói tính năng self-hosted trả phí với giá khoảng $783/tháng, thanh toán hàng năm, nhưng vẫn liệt kê hỗ trợ qua diễn đàn.
- PTOps Professional là gói hỗ trợ giá $200/tháng với hệ thống ticket riêng tư và thời gian phản hồi trong 24 giờ.
- PTOps Enterprise là gói hỗ trợ giá $1,000/tháng với thời gian phản hồi trong 1 giờ, live chat, thiết lập/hỗ trợ SSO, và hỗ trợ cài đặt air-gapped.
- Các sản phẩm không hoàn toàn tương đồng. n8n chủ yếu là tự động hóa workflow. PTOps là tự động hóa workflow cộng với control plane vận hành xung quanh.

### Nguồn tham khảo

- [n8n Pricing](https://n8n.io/pricing/)
- [n8n Community Edition features](https://docs.n8n.io/hosting/community-edition-features/)
- [n8n Choose your n8n](https://docs.n8n.io/choose-n8n/)
- [n8n License key](https://docs.n8n.io/license-key/)
- [n8n Scope of Support](https://support.n8n.io/article/scope-of-support)
- [n8n SSO setup](https://docs.n8n.io/hosting/securing/set-up-sso/)
- [n8n Source control and environments](https://docs.n8n.io/source-control-environments/using/)
- [n8n External secrets](https://docs.n8n.io/external-secrets/)
- [n8n Log streaming](https://docs.n8n.io/log-streaming/)
- [n8n Task runners](https://docs.n8n.io/hosting/configuration/task-runners/)
- [n8n Insights](https://docs.n8n.io/insights/)
- [n8n RBAC projects](https://docs.n8n.io/user-management/rbac/projects/)
- [n8n RBAC role types](https://docs.n8n.io/user-management/rbac/role-types/)
- [n8n Custom project roles](https://docs.n8n.io/user-management/rbac/custom-roles/)
- [n8n License](https://github.com/n8n-io/n8n/blob/master/LICENSE.md)

## Rundeck

Bản so sánh này tập trung vào **self-hosted Rundeck** và **PagerDuty Runbook Automation Self-Hosted** so với **self-hosted PTOps**. Thông tin nghiên cứu được kiểm tra lần cuối vào **ngày 4 tháng 5 năm 2026**.

Rundeck là một trong những sản phẩm có nhiều điểm tương đồng nhất với PTOps vì nó cũng được thiết kế để tự động hóa vận hành, lập lịch job, runbook tự phục vụ và thực thi có kiểm soát trên cơ sở hạ tầng. Nó nhắm trực tiếp vào các đội ngũ platform engineering, DevOps, SRE và IT operations.

Sự khác biệt lớn nhất là cách đóng gói sản phẩm. Rundeck OSS cung cấp sản phẩm tự động hóa runbook mã nguồn mở cốt lõi. PagerDuty Runbook Automation Self-Hosted là sản phẩm thương mại được xây dựng trên Rundeck, và nó bổ sung thêm hỗ trợ enterprise, tính năng high availability, runner thực thi từ xa, SSO, lập lịch nâng cao, webhook nâng cao, trực quan hóa workflow, công cụ ACL dựa trên GUI, và các tính năng quy mô sản xuất khác. PTOps bao gồm tất cả các tính năng của ứng dụng trong phiên bản mã nguồn mở miễn phí, và các gói PTOps trả phí chỉ bổ sung các dịch vụ hỗ trợ (support).

### Phân vị trí (Positioning)

| Lĩnh vực | PTOps | Rundeck |
|------|-------|---------|
| **Phân loại chính** | Nền tảng ops hoàn chỉnh: lập lịch, workflow, monitor, alert, ticket, phản hồi sự cố | Tự động hóa runbook và vận hành tự phục vụ |
| **Self-hosting** | Có | Có |
| **Cloud hosting** | Không | Có, thông qua PagerDuty Runbook Automation SaaS |
| **Mô hình bản quyền** | Mã nguồn mở BSD-3-Clause, bao gồm tất cả tính năng của ứng dụng | Rundeck OSS là Apache-2.0, cùng với các sản phẩm thương mại PagerDuty Runbook Automation |
| **Các gói trả phí** | Đăng ký chỉ dành cho hỗ trợ (support) | License thương mại với các tính năng sản phẩm và hỗ trợ bổ sung |
| **Phù hợp nhất cho** | Các đội ngũ muốn tự động hóa, monitor server, alert, ticket và khắc phục sự cố trong một nền tảng | Các đội ngũ muốn tự động hóa runbook tự phục vụ, ủy quyền thực thi job và các kiểm soát tự động hóa doanh nghiệp |

### Mô hình tính năng

Gói miễn phí của PTOps bao gồm tất cả tính năng của ứng dụng, và các gói Professional và Enterprise trả phí chỉ bổ sung các dịch vụ hỗ trợ, chứ không thêm khả năng sản phẩm. Điều này bao gồm workflow, lập lịch, SSO, user, role, secret, plugin, webhook, monitor, alert, snapshot, ticket, bucket, API và thực thi fleet-aware.

Rundeck OSS bao gồm sản phẩm cốt lõi: thực thi workflow, các plugin cộng đồng, tiêu chuẩn hóa IT workflow, mã hóa key/password, lập lịch ops cơ bản, log hoạt động job, và lưu trữ key. Trang so sánh của PagerDuty liệt kê các tính năng sau đây là các tính năng thương mại của Runbook Automation Self-Hosted và/hoặc Runbook Automation:

- **Enterprise Support:** Hỗ trợ dựa trên mức độ ưu tiên, quản lý tài khoản, phản hồi theo SLA, và các tính năng hỗ trợ thương mại liên quan.
- **High Availability Clusters:** Nhiều instance Rundeck để đảm bảo tính sẵn sàng, cân bằng tải và khả năng chịu lỗi.
- **Enterprise Runner:** Thực thi từ xa an toàn vào các mạng riêng tư và môi trường từ xa mà không cần mở quyền truy cập chiều vào (inbound) tới central server.
- **Failed Job Resume:** Tiếp tục chạy job từ step bị lỗi.
- **Node Health Checks:** Kiểm tra xem các node đã sẵn sàng để thực thi job chưa.
- **Auto Takeover:** Di chuyển các job đã lên lịch sang một thành viên khỏe mạnh trong cluster khi một thành viên khác bị hỏng.
- **Retry Failed Nodes:** Chỉ thử lại job trên các node đã bị lỗi trong lần thực thi trước đó.
- **System Report:** Xem báo cáo thông tin và số liệu thống kê hệ thống cho Rundeck server.
- **Single Sign-On Authentication:** Hỗ trợ SSO thương mại, bao gồm các đường dẫn Okta, Ping và Azure Active Directory đã được ghi nhận trong tài liệu.
- **Certified Enterprise Plugins:** Tích hợp thương mại như PagerDuty, ServiceNow, Datadog, VMware, GitHub, AWS SNS, SQL Runner, và các dịch vụ khác.
- **Advanced Webhooks:** Tích hợp webhook GitHub, AWS SNS, PagerDuty và các webhook khác với xử lý dựa trên quy tắc và gỡ lỗi trong sản phẩm.
- **Load Balanced Workloads:** Mở rộng quy mô cluster theo chiều ngang và chỉ định các thành viên cho lưu lượng hoặc job nhất định.
- **Job Queuing:** Xếp hàng các lượt thực thi khi không cho phép thực thi song song.
- **Workflow Visualization:** Hiển thị workflow trực quan cho các job và các lượt thực thi.
- **Ruleset Workflow Strategy Plugin:** Logic phức tạp hơn xung quanh việc thực thi các step của job.
- **GUI-based ACL Builder and Evaluator:** Quản lý và đánh giá các quy tắc kiểm soát truy cập thông qua UI.
- **Configuration Management:** Thiết lập cấu hình thông qua GUI và lưu trữ nó trong cơ sở dữ liệu Rundeck.
- **AI-generated Runbooks:** Tạo các runbook bằng cách sử dụng các tính năng sản phẩm thương mại.
- **ROI Plugin:** Theo dõi các chỉ số tự động hóa theo kiểu hoàn vốn đầu tư.
- **Job Independent Scheduling:** Quản lý lịch trình độc lập với các định nghĩa job.
- **Blackout Calendaring:** Định nghĩa các khoảng thời gian tắt lịch trình (blackout).
- **Schedule Forecast Visualization:** Xem trước các lượt chạy lịch trình trong tương lai.
- **Missed Job Fires:** Ghi lại các lần thực thi lịch trình bị bỏ lỡ vào lịch sử hoạt động.

### Các gói self-hosted trả phí

| Gói | PTOps | Rundeck |
|------|-------|---------|
| **Self-hosted miễn phí** | Tất cả tính năng của ứng dụng, hỗ trợ cộng đồng, mã nguồn mở BSD-3-Clause | Rundeck OSS, Apache-2.0, tự động hóa runbook cốt lõi và lập lịch cơ bản |
| **Self-hosted cấp trung** | Professional Support: $200/tháng, tất cả tính năng của ứng dụng, hệ thống ticket riêng tư, thời gian phản hồi trong 24 giờ | Không công bố |
| **Self-hosted Enterprise** | Enterprise Support: $1,000/tháng, tất cả tính năng của ứng dụng, thiết lập/hỗ trợ SSO, hỗ trợ cài đặt air-gapped, hệ thống ticket riêng tư, phản hồi trong 1 giờ, live chat | PagerDuty Runbook Automation Self-Hosted, liên hệ bộ phận bán hàng, các tính năng thương mại, hỗ trợ enterprise, yêu cầu license key |

Tài liệu của PagerDuty mô tả Runbook Automation Self-Hosted là phần mềm thương mại yêu cầu license. Họ cũng tuyên bố rằng đăng ký license Runbook Automation là cách duy nhất để nhận được hỗ trợ chuyên nghiệp từ PagerDuty và đội ngũ Rundeck cốt lõi. Ngược lại, các gói trả phí của PTOps là đăng ký hỗ trợ (support) và không mở khóa hoặc hạn chế các tính năng của ứng dụng.

### So sánh hỗ trợ

| Kênh hỗ trợ | PTOps | Rundeck |
|--------------|-------|---------|
| **Trợ giúp từ cộng đồng** | GitHub Discussions, GitHub Issues cho bug, Reddit, Discord, video, tài liệu | GitHub issues, Stack Overflow, Libera Chat, cộng đồng PagerDuty |
| **Hỗ trợ trả phí không thuộc enterprise** | Gói Professional bao gồm hệ thống ticket riêng tư và thời gian phản hồi trong 24 giờ | Không công bố |
| **Hỗ trợ Enterprise** | Gói Enterprise bao gồm hệ thống ticket riêng tư, thời gian phản hồi trong 1 giờ, live chat, thiết lập/hỗ trợ SSO, và hỗ trợ cài đặt air-gapped | License Runbook Automation thương mại bao gồm hỗ trợ enterprise từ PagerDuty và đội ngũ Rundeck cốt lõi |
| **Giá self-hosted được công bố** | $200/tháng cho gói Professional, $1,000/tháng cho gói Enterprise | Liên hệ bộ phận bán hàng |

Hỗ trợ thương mại của Rundeck được liên kết với license Runbook Automation thương mại. PTOps tách biệt các tính năng sản phẩm khỏi hỗ trợ: người dùng có thể chạy ứng dụng hoàn chỉnh miễn phí, sau đó mua gói hỗ trợ Professional hoặc Enterprise khi họ muốn có hệ thống ticket riêng tư, mục tiêu phản hồi, live chat, trợ giúp thiết lập SSO, hoặc hỗ trợ cài đặt air-gapped.

### Phạm vi vận hành

| Khả năng | PTOps | Rundeck |
|------------|-------|---------|
| **Tự động hóa runbook** | Có, thông qua event, workflow, plugin, action, ticket, và cuộc gọi API | Có, đây là thế mạnh cốt lõi của Rundeck |
| **Workflow trực quan** | Có, với các node trigger, event, job, action, limit, controller, và note | Trực quan hóa workflow được liệt kê là một tính năng thương mại |
| **Lập lịch job** | Bộ lập lịch native với các tùy chọn thủ công, schedule, interval, single-shot, plugin, catch-up, blackout, precision, range, và delay | OSS bao gồm lập lịch ops cơ bản; lập lịch nâng cao, blackout calendar, trực quan hóa dự báo, lượt chạy job bị bỏ lỡ, và lập lịch độc lập với job là các tính năng thương mại |
| **Thực thi job fleet-aware** | Các server group native, target expression, thuật toán lựa chọn server, trọng số job, độ đồng thời trên mỗi server, và worker satellite | Kiểm kê node và mô hình dispatch native; Enterprise Runner thương mại bổ sung các trung tâm thực thi từ xa cho môi trường riêng tư |
| **Agent / runner từ xa** | xySat là một runner job từ xa và bộ thu thập metric không có dependency, được cài đặt bằng một lệnh như một dịch vụ trên Linux, Windows, macOS, hoặc Docker | Enterprise Runner là thương mại, cài đặt trên Windows, Linux, hoặc container, yêu cầu Java 11/17, và kết nối ra ngoài qua port 443 |
| **Monitor server** | Các monitor native, biểu đồ time-series, chế độ xem thời gian thực, plugin monitor tùy chỉnh, metric trên mỗi server và mỗi group | Node health check là thương mại, nhưng Rundeck không phải là một nền tảng monitor server tổng quát |
| **Alerting** | Định nghĩa alert native trên dữ liệu server trực tiếp, với các action fire/clear, snapshot, ticket, kiểm soát giới hạn job và hủy job | Tích hợp với các hệ thống sự cố và event, đặc biệt là trong hệ sinh thái PagerDuty, nhưng Rundeck cốt lõi không phải là một nền tảng monitor và alert |
| **Ticket sự cố** | Hệ thống ticket native liên kết với job, alert, file, bình luận, ngày hết hạn, và event có thể chạy được | Tích hợp với các công cụ như ServiceNow trong các dịch vụ thương mại, nhưng không cung cấp cùng một hệ thống ticket gọn nhẹ tích hợp sẵn |
| **Snapshot** | Snapshot server/group tại một thời điểm native cho ngữ cảnh pháp lý và action alert | Không thể so sánh vì không có hệ thống snapshot server native |
| **Secret** | Được mã hóa khi lưu trữ, gán cho event, category, plugin, và webhook, phân phối khi runtime dưới dạng biến môi trường hoặc template | Mã hóa key/password và lưu trữ key được bao gồm trong OSS; tích hợp secret nâng cao hoặc bên ngoài phụ thuộc vào bối cảnh thương mại và plugin |
| **SSO** | Được bao gồm trong ứng dụng mã nguồn mở, với các pattern SSO trusted-header và hướng dẫn thiết lập | Tính năng Runbook Automation thương mại |
| **Kiểm soát truy cập** | Được bao gồm trong ứng dụng mã nguồn mở, với privilege, role, giới hạn category, và giới hạn group | Rundeck hỗ trợ policy ACL; trình tạo và đánh giá ACL dựa trên GUI là các tính năng thương mại |
| **High availability** | Triển khai multi-conductor và các tùy chọn lưu trữ bên ngoài được ghi nhận trong tài liệu, với hỗ trợ Enterprise sẵn có | Clustering high availability, tự động tiếp quản (auto takeover), và phân bổ tải công việc là các tính năng thương mại |
| **Cài đặt air-gapped** | Được hỗ trợ bởi tài liệu, và hỗ trợ Enterprise bao gồm hỗ trợ cài đặt air-gapped | Triển khai self-hosted có sẵn, nhưng quyền truy cập tính năng thương mại và hỗ trợ yêu cầu license Runbook Automation |

### Trường hợp sử dụng hợp lý

Chọn **Rundeck** khi vấn đề chính là tự động hóa runbook tự phục vụ: tập trung hóa các script vận hành, ủy quyền thực thi job an toàn, chạy các lệnh trên kho kiểm kê node, và phù hợp với quy trình phản hồi sự cố tập trung vào PagerDuty hiện có.

Chọn **PTOps** khi vấn đề chính là vận hành cả tự động hóa và cơ sở hạ tầng cùng nhau: lập lịch job trên các server, theo dõi metric server trực tiếp, kích hoạt alert, chụp snapshot, mở ticket, và chạy các workflow khắc phục sự cố từ cùng một hệ thống mà không cần chuyển sang cấp tính năng thương mại.

### Điểm mấu chốt chính

- Rundeck là một so sánh gần gũi vì cả hai sản phẩm đều được xây dựng để tự động hóa vận hành, lập lịch job và thực thi tự phục vụ.
- Rundeck OSS là một nền tảng tự động hóa runbook mã nguồn mở trưởng thành, nhưng nhiều tính năng quy mô production là thương mại trong PagerDuty Runbook Automation.
- PTOps bao gồm tất cả các tính năng ứng dụng trong phiên bản mã nguồn mở, bao gồm SSO, workflow, monitor, alert, ticket, snapshot, secret, role, và lập lịch fleet-aware.
- Rundeck có mức độ nhận diện thương hiệu mạnh mẽ trong tự động hóa runbook và phù hợp tự nhiên cho các đội ngũ đã tiêu chuẩn hóa trên PagerDuty.
- PTOps có lợi thế khi các đội ngũ muốn có tính năng monitor, alert, snapshot, ticket sự cố và tự động hóa trong một ứng dụng self-hosted duy nhất mà không có các cấp sản phẩm bị giới hạn tính năng.
- Giá của Rundeck Runbook Automation Self-Hosted được liệt kê là liên hệ bộ phận bán hàng, trong khi PTOps công bố giá hỗ trợ ở mức $200/tháng cho gói Professional và $1,000/tháng cho gói Enterprise.

### Nguồn tham khảo

- [Rundeck vs Commercial Products](https://www.rundeck.com/community-vs-enterprise)
- [Rundeck homepage](https://www.rundeck.com/)
- [Runbook Automation overview](https://docs.rundeck.com/docs/enterprise/)
- [Runbook Automation Licensing](https://docs.rundeck.com/docs/administration/license.html)
- [Enterprise Runner](https://docs.rundeck.com/docs/administration/runner/)
- [Creating Rundeck Runners](https://docs.rundeck.com/docs/administration/runner/runner-installation/creating-runners.html)
- [Rundeck SSO Security](https://docs.rundeck.com/docs/administration/security/sso/)
- [Rundeck Administrator Guide](https://docs.rundeck.com/docs/administration/)
- [Rundeck License](https://github.com/rundeck/rundeck/blob/main/LICENSE)

## Inngest

Bản so sánh này tập trung vào **self-hosted Inngest** so với **self-hosted PTOps**. Thông tin nghiên cứu được kiểm tra lần cuối vào **ngày 4 tháng 5 năm 2026**.

Inngest là một nền tảng thực thi bền bỉ (durable execution) hướng sự kiện dành cho các nhà phát triển ứng dụng. Nó cho phép các đội ngũ viết các hàm TypeScript, Python, hoặc Go trong codebase của chính họ, sau đó sử dụng Inngest cho các bước bền bỉ, thử lại (retry), lập lịch, kiểm soát luồng, event, queue, và khả năng quan sát (observability). Điều này làm cho nó rất phù hợp cho các job chạy ngầm, workflow AI, workflow sản phẩm, và logic ứng dụng thân thiện với serverless.

PTOps chồng lấp với Inngest xung quanh các workflow, lập lịch, thử lại, queue, event, log, metric, và self-hosting. Sự khác biệt là trọng tâm sản phẩm. Inngest là một workflow engine dành cho nhà phát triển cho mã nguồn ứng dụng. PTOps là một nền tảng vận hành để chạy các job trên cơ sở hạ tầng, giám sát server, kích hoạt alert, mở ticket, chụp snapshot, và điều phối khắc phục sự cố.

### Phân vị trí (Positioning)

| Lĩnh vực | PTOps | Inngest |
|------|-------|---------|
| **Phân loại chính** | Nền tảng ops hoàn chỉnh: lập lịch, workflow, monitor, alert, ticket, phản hồi sự cố | Nền tảng thực thi bền bỉ và workflow engine hướng sự kiện |
| **Self-hosting** | Có | Có |
| **Cloud hosting** | Không | Có |
| **Mô hình bản quyền** | Mã nguồn mở BSD-3-Clause, bao gồm tất cả tính năng của ứng dụng | SSPL có sẵn nguồn mã với thông báo giấy phép tương lai Apache-2.0 |
| **Các gói trả phí** | Đăng ký chỉ dành cho hỗ trợ (support) | Các gói sử dụng được host và các tùy chọn/hỗ trợ enterprise |
| **Phù hợp nhất cho** | Đội ngũ ops muốn tự động hóa, nhận biết server, alert, ticket và runbook ở một nơi | Đội ngũ kỹ thuật sản phẩm muốn các workflow ứng dụng bền bỉ mà không cần quản lý queue và trạng thái |

### Mô hình tính năng

Gói miễn phí của PTOps bao gồm tất cả tính năng của ứng dụng, và các gói Professional và Enterprise trả phí chỉ bổ sung các dịch vụ hỗ trợ, chứ không thêm khả năng sản phẩm. Điều này bao gồm workflow, lập lịch, SSO, user, role, secret, plugin, webhook, monitor, alert, snapshot, ticket, bucket, API và thực thi fleet-aware.

Inngest có thể tự host được, và mã nguồn cho Inngest cùng tất cả các dịch vụ có sẵn trên GitHub. Server self-hosted có thể chạy như một file nhị phân đơn lẻ, với SQLite theo mặc định và các dịch vụ lưu trữ phụ trợ PostgreSQL và Redis tùy chọn. Inngest cũng cung cấp các đường dẫn triển khai dựa trên Docker Compose và Helm.

Trang giá công khai của Inngest chủ yếu dành cho nền tảng được host, nhưng nó cho thấy những khả năng nào được liên kết với các gói trả phí và Enterprise:

- **SAML, RBAC, và audit trail:** Được liệt kê dưới các tính năng của gói Enterprise.
- **Observability có thể xuất được (Exportable observability):** Được liệt kê dưới các tính năng của gói Enterprise.
- **Thời gian lưu trữ trace và log:** 24 giờ trên gói Hobby, 7 ngày trên gói Pro, và 90 ngày trên gói Enterprise.
- **Xuất trace và log:** Được liệt kê dưới dạng chức năng observability có thể xuất được/liên hệ bộ phận bán hàng.
- **Khả năng quan sát nâng cao (Advanced observability):** Được liệt kê dưới dạng tiện ích bổ sung / tính năng nâng cao cho các tích hợp như Datadog.
- **Kênh Slack chuyên dụng:** Được liệt kê dưới các tính năng của gói Enterprise.
- **Quy mô cao hơn:** Các gói Pro và Enterprise nâng giới hạn thực thi, độ đồng thời, kết nối thời gian thực và user.
- **Lượt thực thi và user tùy chỉnh:** Được liệt kê dưới gói Enterprise.
- **Hỗ trợ Enterprise và đảm bảo dịch vụ cho self-hosting:** Tài liệu self-hosting nói rằng hỗ trợ trực tiếp không được đảm bảo cho các instance self-hosted, và hãy liên hệ với Inngest để biết các tùy chọn enterprise nếu cần hỗ trợ chuyên dụng hoặc đảm bảo dịch vụ.

### Các gói self-hosted trả phí

| Gói | PTOps | Inngest |
|------|-------|---------|
| **Self-hosted miễn phí** | Tất cả tính năng của ứng dụng, hỗ trợ cộng đồng, mã nguồn mở BSD-3-Clause | Mã nguồn và các file nhị phân Inngest self-hosted, hỗ trợ qua cộng đồng/GitHub issue, không đảm bảo hỗ trợ trực tiếp |
| **Self-hosted cấp trung** | Professional Support: $200/tháng, tất cả tính năng của ứng dụng, hệ thống ticket riêng tư, thời gian phản hồi trong 24 giờ | Không công bố cho self-hosting; gói Pro được host bắt đầu từ $75/tháng |
| **Self-hosted Enterprise** | Enterprise Support: $1,000/tháng, tất cả tính năng của ứng dụng, thiết lập/hỗ trợ SSO, hỗ trợ cài đặt air-gapped, hệ thống ticket riêng tư, phản hồi trong 1 giờ, live chat | Liên hệ bộ phận bán hàng để có hỗ trợ self-hosted chuyên dụng hoặc đảm bảo dịch vụ |

Đây là một sự khác biệt thực tế cho những người mua self-hosted. PTOps công bố giá hỗ trợ và giữ nguyên bộ tính năng của ứng dụng giống nhau trên các cấp độ sử dụng miễn phí, Professional và Enterprise. Inngest công bố giá cho nền tảng được host, trong khi các cam kết hỗ trợ và dịch vụ self-hosted hướng tới các cuộc hội thoại liên hệ bộ phận bán hàng gói enterprise.

### So sánh hỗ trợ

| Kênh hỗ trợ | PTOps | Inngest |
|--------------|-------|---------|
| **Trợ giúp từ cộng đồng** | GitHub Discussions, GitHub Issues cho bug, Reddit, Discord, video, tài liệu | Cộng đồng Discord, GitHub issues, trung tâm hỗ trợ, tài liệu |
| **Hỗ trợ trả phí không thuộc enterprise** | Gói Professional bao gồm hệ thống ticket riêng tư và thời gian phản hồi trong 24 giờ | Không có gói hỗ trợ self-hosted nào được công bố; gói Pro được host bắt đầu từ $75/tháng |
| **Hỗ trợ Enterprise** | Gói Enterprise bao gồm hệ thống ticket riêng tư, thời gian phản hồi trong 1 giờ, live chat, thiết lập/hỗ trợ SSO, và hỗ trợ cài đặt air-gapped | Liên hệ bộ phận bán hàng để có hỗ trợ chuyên dụng, kênh Slack riêng, và đảm bảo dịch vụ self-hosted |
| **Giá self-hosted được công bố** | $200/tháng cho gói Professional, $1,000/tháng cho gói Enterprise | Không công bố |

Tài liệu của Inngest rất trực tiếp về việc hỗ trợ self-hosting: đội ngũ hỗ trợ không đảm bảo hỗ trợ trực tiếp cho các instance self-hosted, và người dùng nên gửi issue trừ khi họ cần hỗ trợ enterprise hoặc đảm bảo dịch vụ. PTOps cung cấp một lộ trình hỗ trợ Professional chi phí thấp hơn cho người dùng self-hosted production, cộng với một gói Enterprise cho hỗ trợ chuyên sâu hơn.

### Phạm vi vận hành

| Khả năng | PTOps | Inngest |
|------------|-------|---------|
| **Workflow bền bỉ** | Có, thông qua workflow trực quan, job, action, limit, và plugin | Có, đây là sức mạnh cốt lõi của Inngest |
| **Mô hình lập trình** | Các job và plugin có thể chạy các script hoặc chương trình tùy ý trên các server đích | Các hàm được định nghĩa bằng SDK trong TypeScript, Python, hoặc Go |
| **Workflow trực quan** | Có, với các node trigger, event, job, action, limit, controller, và note | Không phải là mô hình biên soạn chính; các workflow được biên soạn trong mã nguồn bằng cách sử dụng các step của hàm |
| **Lập lịch job** | Bộ lập lịch native với các tùy chọn thủ công, schedule, interval, single-shot, plugin, catch-up, blackout, precision, range, và delay | Trigger event, trigger cron, hàm bị trì hoãn, sleep, queue, và job được lên lịch |
| **Kiểm soát luồng** | Các controller workflow, limit, queue, độ đồng thời, thử lại, lựa chọn target, và trọng số job của server | Độ đồng thời, mức độ ưu tiên, throttling, debouncing, rate limiting, batching, tính duy nhất (idempotency), thử lại, và sleep |
| **Thực thi job fleet-aware** | Các server group native, target expression, thuật toán lựa chọn server, trọng số job, độ đồng thời trên mỗi server, và worker satellite | Các hàm chạy trên tài nguyên tính toán của ứng dụng của người dùng; Inngest điều phối việc thực thi nhưng không tập trung vào việc nhắm mục tiêu server-fleet |
| **Agent / runner từ xa** | xySat là một runner job từ xa và bộ thu thập metric không có dependency, được cài đặt bằng một lệnh như một dịch vụ trên Linux, Windows, macOS, hoặc Docker | Không có host agent tương đương. Các hàm Inngest chạy từ compute của ứng dụng của người dùng, và các Connect worker giao tiếp với Inngest server |
| **Monitor server** | Các monitor native, biểu đồ time-series, chế độ xem thời gian thực, plugin monitor tùy chỉnh, metric trên mỗi server và mỗi group | Khả năng quan sát cho hàm và event, nhưng không phải là một nền tảng monitor server tổng quát |
| **Alerting** | Định nghĩa alert native trên dữ liệu server trực tiếp, với các action fire/clear, snapshot, ticket, kiểm soát giới hạn job và hủy job | Alert cơ bản trên các gói được host và khả năng quan sát xung quanh lỗi của hàm, nhưng không phải alert cơ sở hạ tầng |
| **Ticket sự cố** | Hệ thống ticket native liên kết với job, alert, file, bình luận, ngày hết hạn, và event có thể chạy được | Không phải là hệ thống ticket sự cố tích hợp sẵn |
| **Snapshot** | Snapshot server/group tại một thời điểm native cho ngữ cảnh pháp lý và action alert | Không thể so sánh vì không có hệ thống snapshot server native |
| **Secret** | Được mã hóa khi lưu trữ, gán cho event, category, plugin, và webhook, phân phối khi runtime dưới dạng biến môi trường hoặc template | Signing key, event key, các pattern bảo mật SDK, và middleware mã hóa đầu-cuối tùy chọn |
| **SSO** | Được bao gồm trong ứng dụng mã nguồn mở, với các pattern SSO trusted-header và hướng dẫn thiết lập | SAML được liệt kê cho người dùng Enterprise |
| **Role và permission** | Được bao gồm trong ứng dụng mã nguồn mở, với privilege, role, giới hạn category, và giới hạn group | RBAC được liệt kê dưới các tính năng của gói Enterprise |
| **Cài đặt air-gapped** | Được hỗ trợ bởi tài liệu, và hỗ trợ Enterprise bao gồm hỗ trợ cài đặt air-gapped | Có sẵn self-hosting; hỗ trợ self-hosted chuyên dụng và đảm bảo dịch vụ yêu cầu trao đổi enterprise |

### Trường hợp sử dụng hợp lý

Chọn **Inngest** khi vấn đề chính là thực thi bền bỉ bên trong một codebase ứng dụng: các job chạy ngầm, workflow thân thiện với serverless, xử lý event sản phẩm, workflow AI nhiều bước, thử lại, sleep, và kiểm soát luồng kiểu hàng đợi được viết trực tiếp bằng TypeScript, Python, hoặc Go.

Chọn **PTOps** khi vấn đề chính là vận hành cả cơ sở hạ tầng và các workflow production cùng nhau: lập lịch job trên các server, chọn các target khỏe mạnh, xem metric server trực tiếp, kích hoạt alert, đính kèm snapshot, mở ticket, và chạy các job khắc phục sự cố từ cùng một hệ thống.

### Điểm mấu chốt chính

- Inngest là một nền tảng thực thi bền bỉ mạnh mẽ ưu tiên lập trình viên cho các workflow ứng dụng, các job chạy ngầm, xử lý event và các workflow AI.
- PTOps phù hợp hơn khi workflow engine cần nằm cạnh tính năng monitor server, alert, ticket sự cố, snapshot và thực thi job fleet-aware.
- Tự host Inngest được hỗ trợ, nhưng tài liệu nói rằng hỗ trợ trực tiếp không được đảm bảo cho các instance self-hosted trừ khi các gói hỗ trợ chuyên dụng hoặc đảm bảo dịch vụ được sắp xếp thông qua các tùy chọn enterprise.
- Giá công khai của Inngest bắt đầu từ $75/tháng cho gói Pro được host, trong khi giá hỗ trợ self-hosted không được công bố.
- PTOps công bố giá hỗ trợ self-hosted ở mức $200/tháng cho gói Professional và $1,000/tháng cho gói Enterprise, và tất cả các tính năng của ứng dụng đều được bao gồm trong phiên bản mã nguồn mở miễn phí.
- Các sản phẩm không hoàn toàn tương đồng. Inngest chủ yếu là một code-first durable execution engine. PTOps là tự động hóa workflow cộng với control plane vận hành xung quanh.

### Nguồn tham khảo

- [Inngest Pricing](https://www.inngest.com/pricing)
- [Inngest Self-hosting](https://www.inngest.com/docs/self-hosting)
- [Inngest Functions](https://www.inngest.com/docs/learn/inngest-functions)
- [How Inngest Functions Are Executed](https://www.inngest.com/docs/learn/how-functions-are-executed)
- [Inngest Observability and Metrics](https://www.inngest.com/docs/platform/monitor/observability-metrics)
- [Inngest Security](https://www.inngest.com/docs/learn/security)
- [Inngest Encryption Middleware](https://www.inngest.com/docs/features/middleware/encryption-middleware)
- [Inngest Documentation](https://www.inngest.com/docs/)
- [Inngest License](https://github.com/inngest/inngest/blob/main/LICENSE.md)
## Windmill

Bản so sánh này tập trung vào **self-hosted Windmill** so với **self-hosted PTOps**. Thông tin nghiên cứu được kiểm tra lần cuối vào **ngày 4 tháng 5 năm 2026**.

Windmill là một nền tảng tự động hóa lập trình viên và vận hành mã nguồn mở dành cho các script, workflow, ứng dụng nội bộ, trigger, worker, tài nguyên và secret. Đây là một trong những sản phẩm có nhiều điểm tương đồng nhất với PTOps vì nó có thể tự host, thân thiện với code, định hướng workflow, và được xây dựng cho các đội ngũ cần chạy tự động hóa vận hành hơn là chỉ kết nối các công cụ SaaS lại với nhau.

Sự khác biệt lớn nhất là phạm vi sản phẩm. Windmill xuất sắc trong việc biến các script, flow, form, công cụ nội bộ và event trigger thành một nền tảng tự động hóa chia sẻ chung. PTOps là một nền tảng vận hành bao gồm tự động hóa workflow, nhưng cũng bao gồm monitor server, alert, snapshot, ticket sự cố, server group, lựa chọn target và workflow khắc phục sự cố trong cùng một ứng dụng.

### Phân vị trí (Positioning)

| Lĩnh vực | PTOps | Windmill |
|------|-------|----------|
| **Phân loại chính** | Nền tảng ops hoàn chỉnh: lập lịch, workflow, monitor, alert, ticket, phản hồi sự cố | Nền tảng cho lập trình viên để chạy script, workflow, app, trigger, và tự động hóa |
| **Self-hosting** | Có | Có |
| **Cloud hosting** | Không | Có |
| **Mô hình bản quyền** | Mã nguồn mở BSD-3-Clause, bao gồm tất cả tính năng của ứng dụng | Nguồn AGPLv3 / Apache-2.0, cùng với code độc quyền Enterprise và Community Edition |
| **Các gói trả phí** | Đăng ký chỉ dành cho hỗ trợ (support) | Các tính năng Enterprise, seat, đơn vị tính toán và hỗ trợ ưu tiên |
| **Phù hợp nhất cho** | Đội ngũ ops muốn tự động hóa, nhận biết server, alert, ticket và runbook ở một nơi | Đội ngũ muốn chạy các script, workflow, công cụ nội bộ và tự động hóa event từ một nền tảng thân thiện với lập trình viên |

### Mô hình tính năng

Gói miễn phí của PTOps bao gồm tất cả tính năng của ứng dụng, và các gói Professional và Enterprise trả phí chỉ bổ sung các dịch vụ hỗ trợ, chứ không thêm khả năng sản phẩm. Điều này bao gồm workflow, lập lịch, SSO, user, role, secret, plugin, webhook, monitor, alert, snapshot, ticket, bucket, API và thực thi fleet-aware.

Windmill đặc biệt thân thiện với việc tự host. Trang tự host của nó cho biết self-hosting không phải là một lựa chọn hạng hai, và phiên bản mã nguồn mở không có cơ chế phone-home hay server bản quyền. Cấp self-hosted miễn phí bao gồm không giới hạn lượt thực thi, script, app, flow, biến, tài nguyên, trigger Postgres, trigger WebSocket, trigger MQTT, deploy-từ-GitHub, hỗ trợ cơ sở hạ tầng dưới dạng code (IaC), test CI khi deploy, dependency workspace, và workflow dưới dạng code.

Đồng thời, Windmill có phiên bản Enterprise Edition đáng chú ý. Bảng giá liệt kê các giới hạn hoặc tính năng Enterprise sau đây dành cho các triển khai self-hosted:

- **Workspaces:** Gói self-hosted miễn phí bị giới hạn ở 3 workspace; Enterprise là không giới hạn.
- **Users:** Gói self-hosted miễn phí bị giới hạn ở 50 user; Enterprise là không giới hạn.
- **Groups và granular permissions:** Gói self-hosted miễn phí giới hạn ở 4 group; Enterprise là không giới hạn.
- **SSO users:** Gói self-hosted miễn phí cho phép tối đa 10 user với SSO; Enterprise không bị giới hạn số seat.
- **SAML và SCIM:** Enterprise bổ sung hỗ trợ SAML và SCIM bao gồm đồng bộ hóa group.
- **Audit logs:** Enterprise bổ sung không giới hạn audit log.
- **Job run retention:** Gói self-hosted miễn phí giữ chi tiết chạy job tối đa 30 ngày; Enterprise là không giới hạn.
- **External secret backends:** Enterprise bổ sung HashiCorp Vault, Azure Key Vault và AWS Secrets Manager.
- **Workspace service accounts:** Enterprise bổ sung tài khoản dịch vụ workspace.
- **Instance-level roles thông qua instance groups:** Enterprise bổ sung các tính năng group và role ở cấp instance.
- **Custom OAuth và external JWT auth:** Enterprise bổ sung OAuth tùy chỉnh và xác thực bên ngoài với JWT.
- **SOC 2 Type II report:** Sẵn có cho các khách hàng Enterprise.
- **Runtimes BigQuery, Snowflake, Oracle DB, và MS SQL:** Enterprise bổ sung các ngôn ngữ/runtime này.
- **Trigger Kafka, NATS, SQS, GCP, và Azure Event Grid:** Enterprise bổ sung các loại event trigger này.
- **Private Hub:** Enterprise bổ sung một hub nội bộ riêng tư.
- **Content search:** Enterprise bổ sung tìm kiếm nội dung.
- **Workspace object storage trên 50 MB:** Enterprise bổ sung hỗ trợ lưu trữ object lớn hơn.
- **Multiplayer Web IDE:** Enterprise bổ sung cộng tác thời gian thực.
- **Git sync:** Gói self-hosted miễn phí giới hạn ở tối đa 2 user; Enterprise loại bỏ giới hạn này.
- **Agent workers:** Enterprise bổ sung remote worker agent.
- **GitHub App:** Enterprise bổ sung tích hợp GitHub App.
- **Staging/prod UI deploys:** Enterprise bổ sung các tính năng UI thăng cấp triển khai.
- **OpenID Connect:** Enterprise bổ sung OIDC.
- **Codebases và bundles:** Enterprise bổ sung các tính năng codebase và bundle.
- **Private package repositories:** Enterprise bổ sung PyPI riêng tư, npm registry, và các package riêng tư.
- **Distributed dependency cache được hỗ trợ bởi S3:** Enterprise bổ sung cache dependency phân tán.
- **Windows workers:** Enterprise bổ sung hỗ trợ worker Windows.
- **Worker group management UI:** Enterprise bổ sung quản lý worker group thông qua UI.
- **Autoscaling:** Enterprise bổ sung tự động mở rộng quy mô.
- **Critical alerts:** Enterprise bổ sung các tính năng alert nghiêm trọng.
- **Dedicated workers và high throughput:** Enterprise bổ sung worker dành riêng cho script và các tính năng thực thi thông lượng cao.
- **Concurrency limits:** Enterprise bổ sung giới hạn đồng thời.
- **Flow step priority:** Enterprise bổ sung mức độ ưu tiên cho các step của flow.
- **Khởi động lại flow từ bất kỳ node và phiên bản nào:** Enterprise bổ sung các điều khiển khởi động lại flow.
- **Flow lifetime / xóa sau khi sử dụng:** Enterprise bổ sung các điều khiển lưu giữ trên mỗi flow.
- **Approval forms và prompt:** Enterprise bổ sung thêm các tùy chọn step phê duyệt nâng cao.
- **Global CSS, workspace default app, app report, và custom React component:** Enterprise bổ sung các tính năng xây dựng ứng dụng (app-builder) này.
- **Hỗ trợ ưu tiên:** Enterprise bao gồm hỗ trợ ưu tiên 24/7, phản hồi trong 3 giờ cho Enterprise, và kênh Slack hoặc Discord chuyên dụng.

### Các gói self-hosted trả phí

| Gói | PTOps | Windmill |
|------|-------|----------|
| **Self-hosted miễn phí** | Tất cả tính năng của ứng dụng, hỗ trợ cộng đồng, mã nguồn mở BSD-3-Clause | Gói self-hosted miễn phí và mã nguồn mở, không giới hạn lượt thực thi, hỗ trợ từ cộng đồng, các giới hạn tính năng được liệt kê ở trên |
| **Self-hosted cấp trung** | Professional Support: $200/tháng, tất cả tính năng của ứng dụng, hệ thống ticket riêng tư, thời gian phản hồi trong 24 giờ | Enterprise self-hosted bắt đầu từ $120/tháng, với seat và đơn vị tính toán được tính giá riêng biệt |
| **Self-hosted Enterprise** | Enterprise Support: $1,000/tháng, tất cả tính năng của ứng dụng, thiết lập/hỗ trợ SSO, hỗ trợ cài đặt air-gapped, hệ thống ticket riêng tư, phản hồi trong 1 giờ, live chat | Enterprise self-hosted với các tính năng Enterprise Edition, license thương mại, SLA, hỗ trợ ưu tiên, và kênh Slack hoặc Discord chuyên dụng |

Windmill công bố giá self-hosted. Mô hình định giá phức tạp hơn PTOps vì Windmill tính phí cho các tính năng Enterprise, seat và đơn vị tính toán. Giá của PTOps đơn giản hơn: tất cả tính năng của ứng dụng đều miễn phí, và các gói trả phí là đăng ký hỗ trợ (support).

### So sánh hỗ trợ

| Kênh hỗ trợ | PTOps | Windmill |
|--------------|-------|----------|
| **Trợ giúp từ cộng đồng** | GitHub Discussions, GitHub Issues cho bug, Reddit, Discord, video, tài liệu | Discord, GitHub Issues, trang Hỏi đáp, tài liệu |
| **Hỗ trợ trả phí không thuộc enterprise** | Gói Professional bao gồm hệ thống ticket riêng tư và thời gian phản hồi trong 24 giờ | Tài liệu hỗ trợ Team và Pro mô tả hỗ trợ ưu tiên 24/7 với mục tiêu phản hồi trong 48 giờ |
| **Hỗ trợ Enterprise** | Gói Enterprise bao gồm hệ thống ticket riêng tư, thời gian phản hồi trong 1 giờ, live chat, thiết lập/hỗ trợ SSO, và hỗ trợ cài đặt air-gapped | Tài liệu hỗ trợ Enterprise mô tả hỗ trợ ưu tiên 24/7, phản hồi trong 3 giờ, hỗ trợ từ kỹ sư tự động hóa, và Slack hoặc Discord chuyên dụng |
| **Giá self-hosted được công bố** | $200/tháng cho gói Professional, $1,000/tháng cho gói Enterprise | Self-hosted Enterprise bắt đầu từ $120/tháng, với seat và đơn vị tính toán được tính giá riêng |

Hỗ trợ trả phí của Windmill được liên kết với đăng ký Enterprise/sản phẩm, và mục tiêu phản hồi hỗ trợ Enterprise của họ rất mạnh mẽ. PTOps cung cấp mô hình chỉ dành cho hỗ trợ truyền thống hơn: Hỗ trợ Professional có sẵn ở mức $200/tháng mà không làm thay đổi bộ tính năng của ứng dụng, và hỗ trợ Enterprise bổ sung phản hồi nhanh hơn, live chat, hỗ trợ/thiết lập SSO, và hỗ trợ cài đặt air-gapped.

### Phạm vi vận hành

| Khả năng | PTOps | Windmill |
|------------|-------|----------|
| **Script và job** | Có, thông qua event, job, plugin, shell, API, và workflow | Có, đây là thế mạnh cốt lõi của Windmill |
| **Mô hình lập trình** | Plugin và job có thể chạy các script hoặc chương trình tùy ý trên các server đích | Các script và step của flow bằng TypeScript, Python, Go, PHP, Bash, SQL, và các runtime được hỗ trợ khác |
| **Workflow trực quan** | Có, với các node trigger, event, job, action, limit, controller, và note | Có, với trình chỉnh sửa flow low-code và workflow dưới dạng code |
| **Ứng dụng nội bộ** | UI vận hành và ticket được tích hợp sẵn; xây dựng ứng dụng tùy chỉnh không phải phân loại sản phẩm chính | Có, Windmill bao gồm các công cụ xây dựng ứng dụng low-code và full-code |
| **Lập lịch job** | Bộ lập lịch native với các tùy chọn thủ công, schedule, interval, single-shot, plugin, catch-up, blackout, precision, range, và delay | Lịch trình, webhook, trigger email, route HTTP, WebSocket, trigger Postgres, trigger MQTT, và trigger event Enterprise |
| **Kiểm soát luồng** | Các controller workflow, limit, queue, độ đồng thời, thử lại, lựa chọn target, và trọng số job của server | Rẽ nhánh, vòng lặp, thử lại, bộ xử lý lỗi, sleep, phê duyệt, giới hạn độ đồng thời, mức độ ưu tiên, và tính năng khởi động lại flow |
| **Thực thi job fleet-aware** | Các server group native, target expression, thuật toán lựa chọn server, trọng số job, độ đồng thời trên mỗi server, và worker satellite | Worker và worker group là trọng tâm, nhưng PTOps được xây dựng trực tiếp hơn xung quanh kho kiểm kê server, tình trạng sức khỏe và lựa chọn target |
| **Agent / runner từ xa** | xySat là một runner job từ xa và bộ thu thập metric không có dependency, được cài đặt bằng một lệnh như một dịch vụ trên Linux, Windows, macOS, hoặc Docker | Worker bình thường có sẵn trong triển khai self-hosted, nhưng remote worker agent là tính năng Cloud và Self-hosted Enterprise; worker agent có thể chạy trên Linux, Windows, hoặc macOS, và worker Windows native là tính năng của Self-hosted Enterprise |
| **Monitor server** | Các monitor native, biểu đồ time-series, chế độ xem thời gian thực, plugin monitor tùy chỉnh, metric trên mỗi server và mỗi group | Khả năng quan sát cho job, queue, log, worker và dịch vụ, nhưng không phải là một nền tảng monitor server tổng quát |
| **Alerting** | Định nghĩa alert native trên dữ liệu server trực tiếp, với các action fire/clear, snapshot, ticket, kiểm soát giới hạn job và hủy job | Alert nghiêm trọng là Enterprise, tập trung vào các hoạt động của Windmill hơn là alert cơ sở hạ tầng rộng rãi |
| **Ticket sự cố** | Hệ thống ticket native liên kết với job, alert, file, bình luận, ngày hết hạn, và event có thể chạy được | Không phải là hệ thống ticket sự cố tích hợp sẵn |
| **Snapshot** | Snapshot server/group tại một thời điểm native cho ngữ cảnh pháp lý và action alert | Không thể so sánh vì không có hệ thống snapshot server native |
| **Secret** | Được mã hóa khi lưu trữ, gán cho event, category, plugin, và webhook, phân phối khi runtime dưới dạng biến môi trường hoặc template | Biến, tài nguyên, secret, mã hóa secret workspace, và các backend secret bên ngoài của Enterprise |
| **SSO** | Được bao gồm trong ứng dụng mã nguồn mở, với các pattern SSO trusted-header và hướng dẫn thiết lập | Gói self-hosted miễn phí bao gồm tối đa 10 SSO user; SSO không giới hạn, SAML, và SCIM là tính năng Enterprise |
| **Role và permission** | Được bao gồm trong ứng dụng mã nguồn mở, với privilege, role, giới hạn category, và giới hạn group | Role, thư mục, ACL, group, và permission chi tiết, với giới hạn group cao hơn và các role ở cấp instance trong Enterprise |
| **Cài đặt air-gapped** | Được hỗ trợ bởi tài liệu, và hỗ trợ Enterprise bao gồm hỗ trợ cài đặt air-gapped | Triển khai self-hosted được hỗ trợ; Enterprise self-hosting sử dụng license key và báo cáo đăng ký/sử dụng |

### Trường hợp sử dụng hợp lý

Chọn **Windmill** khi vấn đề chính là cung cấp cho lập trình viên và đội ngũ vận hành một nền tảng chung cho các script, flow, trigger, ứng dụng nội bộ, worker queue, tài nguyên và secret, đặc biệt khi xây dựng các công cụ nội bộ là một phần của mục tiêu.

Chọn **PTOps** khi vấn đề chính là vận hành cả cơ sở hạ tầng và các workflow production cùng nhau: lập lịch job trên các server, chọn các target khỏe mạnh, xem metric server trực tiếp, kích hoạt alert, đính kèm snapshot, mở ticket, và chạy các job khắc phục sự cố từ cùng một hệ thống.

### Điểm mấu chốt chính

- Windmill là một trong những so sánh self-hosted mạnh mẽ nhất vì nó bao gồm script, workflow, app, trigger, worker, secret, permission, và tự động hóa thân thiện với lập trình viên.
- Gói self-hosted miễn phí của Windmill rất hào phóng, nhưng Enterprise bổ sung thêm nhiều tính năng bảo mật, khả năng quan sát, triển khai, hiệu suất, kiểm soát luồng, trigger, worker và xây dựng ứng dụng.
- PTOps bao gồm tất cả tính năng của ứng dụng trong phiên bản mã nguồn mở, bao gồm SSO, role, workflow, monitor, alert, ticket, plugin, webhook, bucket, secret, snapshot, và lập lịch fleet-aware.
- Windmill có lợi thế mạnh mẽ khi mục tiêu bao gồm xây dựng ứng dụng nội bộ và biên soạn script/flow hướng tới nhà phát triển trên nhiều ngôn ngữ.
- PTOps có lợi thế khi nền tảng tự động hóa cũng phải là nền tảng monitor, alert, ticket sự cố, snapshot và khắc phục sự cố.
- Windmill công bố giá Enterprise self-hosted bắt đầu từ $120/tháng, với seat và đơn vị tính toán được tính riêng. PTOps công bố giá hỗ trợ ở mức $200/tháng cho gói Professional và $1,000/tháng cho gói Enterprise, và không hạn chế các tính năng của ứng dụng đằng sau các gói trả phí.

### Nguồn tham khảo

- [Windmill Pricing](https://www.windmill.dev/pricing)
- [Windmill Self-host](https://www.windmill.dev/docs/advanced/self_host)
- [Windmill No-ops self-host](https://www.windmill.dev/platform/self-host)
- [Windmill Plans and How to Upgrade](https://www.windmill.dev/docs/misc/plans_details)
- [Windmill Support and SLA](https://www.windmill.dev/docs/misc/support_and_sla)
- [Windmill Flow Editor](https://www.windmill.dev/docs/flows/flow_editor)
- [Windmill Jobs](https://www.windmill.dev/docs/core_concepts/jobs)
- [Windmill Agent Workers](https://www.windmill.dev/docs/core_concepts/agent_workers)
- [Windmill Windows Workers](https://www.windmill.dev/docs/misc/windows_workers)
- [Windmill Audit Logs](https://www.windmill.dev/docs/core_concepts/audit_logs)
- [Windmill Version Control](https://www.windmill.dev/docs/advanced/version_control)
- [Windmill License](https://github.com/windmill-labs/windmill/blob/main/LICENSE)

## Kestra

Bản so sánh này tập trung vào **self-hosted Kestra** so với **self-hosted PTOps**. Thông tin nghiên cứu được kiểm tra lần cuối vào **ngày 4 tháng 5 năm 2026**.

Kestra là một nền tảng điều phối khai báo (declarative orchestration) mã nguồn mở cho các workflow, data pipeline, tự động hóa cơ sở hạ tầng, microservice, workflow Python, workflow AI, và các quy trình hướng sự kiện. Nó rất phù hợp cho các đội ngũ muốn các workflow được định nghĩa bằng YAML, danh mục plugin lớn, quản lý vòng đời theo kiểu GitOps, và điều phối có thể chỉnh sửa cả bằng code và trong UI.

PTOps chồng lấp với Kestra xung quanh điều phối workflow, lập lịch, event, thử lại, độ đồng thời, plugin, log, tự động hóa dựa trên API, và self-hosting. Sự khác biệt là phạm vi vận hành. Kestra chủ yếu là một bộ điều phối quy trình/dữ liệu và workflow tổng quát. PTOps là một nền tảng vận hành kết hợp tự động hóa workflow với monitor server, alert, snapshot, ticket sự cố, nhắm mục tiêu server và các workflow khắc phục sự cố.

### Phân vị trí (Positioning)

| Lĩnh vực | PTOps | Kestra |
|------|-------|--------|
| **Phân loại chính** | Nền tảng ops hoàn chỉnh: lập lịch, workflow, monitor, alert, ticket, phản hồi sự cố | Nền tảng điều phối khai báo và tự động hóa workflow |
| **Self-hosting** | Có | Có |
| **Cloud hosting** | Không | Có |
| **Mô hình bản quyền** | Mã nguồn mở BSD-3-Clause, bao gồm tất cả tính năng của ứng dụng | Mã nguồn mở Apache-2.0, cùng với phiên bản Enterprise Edition thương mại |
| **Các gói trả phí** | Đăng ký chỉ dành cho hỗ trợ (support) | Các tính năng của phiên bản Enterprise Edition, sự thành công của khách hàng và các cấp hỗ trợ |
| **Phù hợp nhất cho** | Đội ngũ ops muốn tự động hóa, nhận biết server, alert, ticket và runbook ở một nơi | Đội ngũ dữ liệu, platform và kỹ thuật muốn có các workflow khai báo, plugin và điều phối hướng sự kiện |

### Mô hình tính năng

Gói miễn phí của PTOps bao gồm tất cả tính năng của ứng dụng, và các gói Professional và Enterprise trả phí chỉ bổ sung các dịch vụ hỗ trợ, chứ không thêm khả năng sản phẩm. Điều này bao gồm workflow, lập lịch, SSO, user, role, secret, plugin, webhook, monitor, alert, snapshot, ticket, bucket, API và thực thi fleet-aware.

Kestra Open Source rất rộng và hướng tới production. Trang giá liệt kê các workflow khai báo, hơn 1.300 plugin, lập lịch hướng sự kiện, logic nghiệp vụ bằng bất kỳ ngôn ngữ nào, chỉnh sửa code/UI, tích hợp và lập phiên bản Git, triển khai đa đám mây và air-gapped, không giới hạn flow, và không giới hạn lượt thực thi.

Kestra Enterprise Edition bổ sung các tính năng quan trọng nhất cho các đội ngũ lớn hơn, môi trường được kiểm soát và các triển khai high-availability:

- **Xác thực nâng cao:** SSO/OIDC, LDAP, SCIM, lời mời, quản lý user và tài khoản dịch vụ.
- **Role-Based Access Control:** Quyền chi tiết ở cấp user, group và namespace.
- **Multi-tenancy:** Các tenant cách ly cho các đội ngũ, project hoặc môi trường khác nhau.
- **Tính khả dụng cao (High availability):** Điều phối hướng sự kiện được hỗ trợ bởi Kafka và log/metric được hỗ trợ bởi Elasticsearch để mở rộng quy mô và chịu lỗi.
- **Worker groups:** Nhắm mục tiêu rõ ràng vào cơ sở hạ tầng chuyên biệt để thực thi task hoặc đánh giá trigger thăm dò.
- **Task runners:** Đẩy các task chuyên sâu về tính toán sang Kubernetes hoặc các dịch vụ batch đám mây như AWS ECS Fargate, Azure Batch, Google Cloud Run, và các dịch vụ khác.
- **Quản lý secret chuyên dụng:** Các tùy chọn quản lý secret nội bộ, bên ngoài, ở cấp namespace, cấp tenant, và chỉ đọc.
- **Các bộ quản lý secret bên ngoài:** Tích hợp như AWS Secrets Manager, Azure Key Vault, Google Secret Manager, HashiCorp Vault, Doppler, 1Password, và các dịch vụ khác.
- **Audit logs:** Theo dõi hành động của user và các thay đổi tài nguyên để tuân thủ và điều tra.
- **Bộ tổng hợp log bên ngoài:** Chuyển log sang các hệ thống observability bên ngoài như Datadog hoặc Elasticsearch.
- **Storage isolation:** Cách ly bộ nhớ lưu trữ và secret giữa các đội ngũ hoặc tenant.
- **Cho phép và hạn chế plugin:** Kiểm soát tập trung các plugin nào được phép chạy.
- **Lập phiên bản plugin:** Ghim phiên bản plugin trên mỗi môi trường để triển khai và nâng cấp an toàn hơn.
- **Apps:** Xây dựng các UI tùy chỉnh cho các workflow với các form, phê duyệt và dashboard.
- **Human-in-the-loop approvals:** Tạm dừng và tiếp tục thực thi workflow với các đầu vào tùy chỉnh.
- **Custom blueprints:** Duy trì các template workflow có thể tái sử dụng riêng tư.
- **Tài sản và lineage (Assets and lineage):** Theo dõi các tài nguyên được chạm bởi các workflow.
- **Unit tests:** Thêm các kiểm thử cách ly cho các flow với fixture và assertion.
- **Maintenance mode:** Xếp hàng các lần thực thi mới trong khi các task đang tiến hành hoàn tất trong quá trình nâng cấp.
- **Monitor cluster:** Giám sát tình trạng sức khỏe của cluster và hiệu suất cơ sở hạ tầng.
- **Backup và restore:** Khôi phục sau các lần xóa vô tình hoặc lỗi hệ thống.
- **Kill switch:** Dừng các thực thi có vấn đề theo phạm vi.
- **Thông báo hệ thống:** Gửi các thông báo bảo trì hoặc chính sách bên trong sản phẩm.
- **Enterprise plugins:** Truy cập các tích hợp thương mại và các tính năng tập trung vào enterprise.
- **Enterprise support:** Đảm bảo hỗ trợ theo SLA, onboarding, sự thành công của khách hàng, và quyền truy cập cổng thông tin khách hàng.

### Các gói self-hosted trả phí

| Gói | PTOps | Kestra |
|------|-------|--------|
| **Self-hosted miễn phí** | Tất cả tính năng của ứng dụng, hỗ trợ cộng đồng, mã nguồn mở BSD-3-Clause | Phiên bản Open Source Edition, Apache-2.0, không giới hạn flow và thực thi, hỗ trợ từ cộng đồng |
| **Self-hosted cấp trung** | Professional Support: $200/tháng, tất cả tính năng của ứng dụng, hệ thống ticket riêng tư, thời gian phản hồi trong 24 giờ | Không công bố; Enterprise Edition là liên hệ bộ phận bán hàng |
| **Self-hosted Enterprise** | Enterprise Support: $1,000/tháng, tất cả tính năng của ứng dụng, thiết lập/hỗ trợ SSO, hỗ trợ cài đặt air-gapped, hệ thống ticket riêng tư, phản hồi trong 1 giờ, live chat | Enterprise Edition, liên hệ bộ phận bán hàng, đăng ký hàng năm cho mỗi instance, không giới hạn flow/task/thực thi, các tính năng Enterprise và hỗ trợ |

Kestra không công bố giá Enterprise self-hosted. Trang giá của nó mô tả Enterprise Edition là một gói đăng ký hàng năm với mô hình trên mỗi instance và không giới hạn flow, task, và lượt thực thi. PTOps công bố giá hỗ trợ cố định và không đặt các tính năng của ứng dụng đằng sau các gói trả phí.

### So sánh hỗ trợ

| Kênh hỗ trợ | PTOps | Kestra |
|--------------|-------|--------|
| **Trợ giúp từ cộng đồng** | GitHub Discussions, GitHub Issues cho bug, Reddit, Discord, video, tài liệu | Slack, GitHub, tài liệu, video, các kênh cộng đồng |
| **Hỗ trợ trả phí không thuộc enterprise** | Gói Professional bao gồm hệ thống ticket riêng tư và thời gian phản hồi trong 24 giờ | Không công bố cho Open Source self-hosted |
| **Hỗ trợ Enterprise** | Gói Enterprise bao gồm hệ thống ticket riêng tư, thời gian phản hồi trong 1 giờ, live chat, thiết lập/hỗ trợ SSO, và hỗ trợ cài đặt air-gapped | Enterprise bao gồm Hỗ trợ Tiêu chuẩn (Standard Support) theo mặc định; Premium và Platinum bổ sung các SLA nhanh hơn và Teams/Slack chuyên dụng |
| **Giá self-hosted được công bố** | $200/tháng cho gói Professional, $1,000/tháng cho gói Enterprise | Liên hệ bộ phận bán hàng |

Bảng hỗ trợ được công bố của Kestra liệt kê Standard, Premium, và Platinum. Standard bao gồm hỗ trợ qua email, phạm vi phủ sóng 8x5, và SLA phản hồi P0 trong 24 giờ. Premium bổ sung email cộng với Teams/Slack chuyên dụng và SLA P0 trong 6 giờ. Platinum bổ sung phạm vi phủ sóng 24x7, SLA phản hồi P0 trong 1 giờ, và các dịch vụ tư vấn chuyên gia. Hỗ trợ của PTOps đơn giản hơn và chỉ dành cho hỗ trợ: gói Professional cung cấp hệ thống ticket riêng tư với thời gian phản hồi trong 24 giờ, và Enterprise bổ sung phản hồi trong 1 giờ, live chat, hỗ trợ/thiết lập SSO, và hỗ trợ cài đặt air-gapped.

### Phạm vi vận hành

| Khả năng | PTOps | Kestra |
|------------|-------|--------|
| **Điều phối workflow** | Có, thông qua workflow trực quan, job, action, limit, và plugin | Có, đây là thế mạnh cốt lõi của Kestra |
| **Mô hình lập trình** | Plugin và job có thể chạy các script hoặc chương trình tùy ý trên các server đích | Các workflow YAML khai báo, plugin, trình chỉnh sửa code nhúng, và các task bằng nhiều ngôn ngữ |
| **Workflow trực quan** | Có, với các node trigger, event, job, action, limit, controller, và note | Có, thiết kế và thực thi workflow có sẵn từ UI và dưới dạng code |
| **Lập lịch job** | Bộ lập lịch native với các tùy chọn thủ công, schedule, interval, single-shot, plugin, catch-up, blackout, precision, range, và delay | Lịch trình, flow, webhook, polling, và realtime trigger |
| **Kiểm soát luồng** | Các controller workflow, limit, queue, độ đồng thời, thử lại, lựa chọn target, và trọng số job của server | Các flowable task, thử lại, timeout task, giới hạn độ đồng thời, định nghĩa SLA, subflow, backfill, phát lại (replay), và cache task |
| **Thực thi job fleet-aware** | Các server group native, target expression, thuật toán lựa chọn server, trọng số job, độ đồng thời trên mỗi server, và worker satellite | Các worker group và task runner là Enterprise, nhưng Kestra không tập trung vào kho kiểm kê server và lựa chọn target dựa trên sức khỏe |
| **Agent / runner từ xa** | xySat là một runner job từ xa và bộ thu thập metric không có dependency, được cài đặt bằng một lệnh như một dịch vụ trên Linux, Windows, macOS, hoặc Docker | Các Process và Docker task runner là Open Source; Process runner hoạt động trên Linux, macOS, và Windows. Worker Group và các cloud task runner như Kubernetes, AWS Batch, Azure Batch, Google Batch, và Cloud Run yêu cầu phiên bản Enterprise hoặc Kestra Cloud |
| **Monitor server** | Các monitor native, biểu đồ time-series, chế độ xem thời gian thực, plugin monitor tùy chỉnh, metric trên mỗi server và mỗi group | Giám sát cluster, log, metric, hỗ trợ OpenTelemetry và Prometheus, nhưng không phải là một nền tảng monitor server tổng quát |
| **Alerting** | Định nghĩa alert native trên dữ liệu server trực tiếp, với các action fire/clear, snapshot, ticket, kiểm soát giới hạn job và hủy job | Các tính năng quan sát xung quanh SLA, trạng thái thực thi và workflow, nhưng không phải alert cơ sở hạ tầng rộng rãi |
| **Ticket sự cố** | Hệ thống ticket native liên kết với job, alert, file, bình luận, ngày hết hạn, và event có thể chạy được | Không phải là hệ thống ticket sự cố tích hợp sẵn |
| **Snapshot** | Snapshot server/group tại một thời điểm native cho ngữ cảnh pháp lý và action alert | Không thể so sánh vì không có hệ thống snapshot server native |
| **Secret** | Được mã hóa khi lưu trữ, gán cho event, category, plugin, và webhook, phân phối khi runtime dưới dạng biến môi trường hoặc template | Phiên bản Open Source có các khái niệm secret; Enterprise bổ sung các bộ quản lý secret ở cấp namespace/tenant, nội bộ/bên ngoài, và chỉ đọc |
| **SSO** | Được bao gồm trong ứng dụng mã nguồn mở, với các pattern SSO trusted-header và hướng dẫn thiết lập | Tính năng Enterprise |
| **Role và permission** | Được bao gồm trong ứng dụng mã nguồn mở, với privilege, role, giới hạn category, và giới hạn group | Enterprise RBAC với các tính năng user, group, namespace, service account, và SCIM |
| **Cài đặt air-gapped** | Được hỗ trợ bởi tài liệu, và hỗ trợ Enterprise bao gồm hỗ trợ cài đặt air-gapped | Trang giá liệt kê triển khai đa đám mây và air-gapped cho cả hai phiên bản; Enterprise có thể chạy trên đám mây, on-prem, hoặc air-gapped |

### Trường hợp sử dụng hợp lý

Chọn **Kestra** when vấn đề chính là điều phối workflow khai báo trên dữ liệu, cơ sở hạ tầng, AI, microservice, và các quy trình hướng sự kiện, đặc biệt khi các đội ngũ muốn các workflow ưu tiên YAML, một hệ sinh thái plugin lớn, quản lý vòng đời kiểu Git/Terraform, và quản trị cấp doanh nghiệp.

Chọn **PTOps** khi vấn đề chính là vận hành cả cơ sở hạ tầng và các workflow production cùng nhau: lập lịch job trên các server, chọn các target khỏe mạnh, xem metric server trực tiếp, kích hoạt alert, đính kèm snapshot, mở ticket, và chạy các job khắc phục sự cố từ cùng một hệ thống.

### Điểm mấu chốt chính

- Kestra là một bộ điều phối workflow mã nguồn mở mạnh mẽ với số lượng flow và lượt thực thi không giới hạn, một danh mục plugin lớn, và một mô hình workflow code/UI.
- Kestra Enterprise bổ sung hầu hết các tính năng quản trị cho đội ngũ lớn, kiểm soát truy cập, multi-tenancy, high-availability, cách ly worker, hỗ trợ, và tuân thủ.
- PTOps bao gồm tất cả tính năng của ứng dụng trong phiên bản mã nguồn mở, bao gồm SSO, role, workflow, monitor, alert, ticket, plugin, webhook, bucket, secret, snapshot, và lập lịch fleet-aware.
- Kestra là một sự lựa chọn phù hợp hơn cho điều phối dữ liệu/platform, các pipeline khai báo và quản trị workflow enterprise.
- PTOps có lợi thế khi nền tảng tự động hóa cũng phải là nền tảng monitor, alert, ticket sự cố, snapshot và khắc phục sự cố.
- Giá Kestra Enterprise là liên hệ bộ phận bán hàng, trong khi PTOps công bố giá hỗ trợ ở mức $200/tháng cho gói Professional và $1,000/tháng cho gói Enterprise, và không hạn chế các tính năng của ứng dụng đằng sau các cấp độ trả phí.

### Nguồn tham khảo

- [Kestra Pricing](https://kestra.io/pricing)
- [Open-Source vs. Enterprise Edition of Kestra](https://kestra.io/docs/oss-vs-paid)
- [Kestra Enterprise Overview](https://kestra.io/docs/enterprise/overview)
- [Kestra Enterprise Features](https://kestra.io/docs/enterprise/overview/enterprise-edition)
- [Kestra Worker Groups](https://kestra.io/docs/enterprise/scalability/worker-group)
- [Kestra Task Runners](https://kestra.io/docs/enterprise/scalability/task-runners)
- [Kestra Process Task Runner](https://kestra.io/docs/task-runners/types/process-task-runner)
- [Kestra Documentation](https://kestra.io/docs)
- [Why Kestra](https://kestra.io/docs/why-kestra)
- [Kestra Features](https://kestra.io/features)
- [Kestra License](https://github.com/kestra-io/kestra/blob/develop/LICENSE)

## Trigger.dev

Bản so sánh này tập trung vào **self-hosted Trigger.dev** so với **self-hosted PTOps**. Thông tin nghiên cứu được kiểm tra lần cuối vào **ngày 4 tháng 5 năm 2026**.

Trigger.dev là một framework các job chạy ngầm mã nguồn mở dành cho các lập trình viên. Nó cho phép các đội ngũ viết các task chạy lâu và các workflow đáng tin cậy trong code ứng dụng bình thường, với các hàng đợi, thử lại, lịch trình, độ trễ, khả năng quan sát (observability), API Realtime, và các hoạt động dựa trên dashboard. Nó đặc biệt mạnh mẽ cho các agent AI, các task sản phẩm chạy lâu, các job chạy ngầm thân thiện với serverless, và các workflow nằm gần codebase ứng dụng.

PTOps chồng lấp với Trigger.dev xung quanh job, workflow, lập lịch, thử lại, hàng đợi, event, log, metric, thực thi dựa trên API, và self-hosting. Sự khác biệt là phạm vi vận hành. Trigger.dev là một nền tảng job chạy ngầm ưu tiên nhà phát triển. PTOps là một nền tảng vận hành kết hợp tự động hóa job và workflow với monitor server, alert, snapshot, ticket sự cố, nhắm mục tiêu server và các workflow khắc phục sự cố.

### Phân vị trí (Positioning)

| Lĩnh vực | PTOps | Trigger.dev |
|------|-------|-------------|
| **Phân loại chính** | Nền tảng ops hoàn chỉnh: lập lịch, workflow, monitor, alert, ticket, phản hồi sự cố | Framework cho job chạy ngầm và task bền bỉ |
| **Self-hosting** | Có | Có |
| **Cloud hosting** | Không | Có |
| **Mô hình bản quyền** | Mã nguồn mở BSD-3-Clause, bao gồm tất cả tính năng của ứng dụng | Mã nguồn mở Apache-2.0 |
| **Các gói trả phí** | Đăng ký chỉ dành cho hỗ trợ (support) | Gói sử dụng được host và hỗ trợ/tính năng Enterprise |
| **Phù hợp nhất cho** | Đội ngũ ops muốn tự động hóa, nhận biết server, alert, ticket và runbook ở một nơi | Lập trình viên muốn các job chạy ngầm và các workflow đáng tin cậy bên trong codebase ứng dụng của họ |

### Mô hình tính năng

Gói miễn phí của PTOps bao gồm tất cả tính năng của ứng dụng, và các gói Professional và Enterprise trả phí chỉ bổ sung các dịch vụ hỗ trợ, chứ không thêm khả năng sản phẩm. Điều này bao gồm workflow, lập lịch, SSO, user, role, secret, plugin, webhook, monitor, alert, snapshot, ticket, bucket, API và thực thi fleet-aware.

Trigger.dev là mã nguồn mở Apache-2.0 và có thể tự host. Tài liệu của nó mô tả phiên bản self-hosted là một tập hợp các container được chia thành webapp và worker, với các đường dẫn triển khai Docker Compose và Kubernetes. Tài liệu cũng tuyên bố rằng phiên bản self-hosted hoạt động chức năng tương tự như Trigger.dev Cloud với một số ngoại lệ.

Các tài liệu tự host chính thức liệt kê các khác biệt chỉ dành cho Cloud này:

- **Warm starts:** Khởi động nhanh hơn cho các lượt chạy liên tiếp có sẵn trên Trigger.dev Cloud, không có trên self-hosted.
- **Auto-scaling:** Cloud tự động xử lý việc mở rộng quy mô worker; triển khai self-hosted yêu cầu mở rộng quy mô worker thủ công.
- **Checkpoints:** Cloud hỗ trợ các hoạt động chờ không chặn (non-blocking wait) sử dụng ít tài nguyên hơn; triển khai self-hosted không hỗ trợ.
- **Hỗ trợ chuyên dụng:** Hỗ trợ trực tiếp từ đội ngũ Trigger.dev được bao gồm trong Cloud, không có cho self-hosting.
- **Độ tin cậy được quản lý:** Tài liệu nói rằng Trigger.dev không thể đảm bảo hiệu suất trên cơ sở hạ tầng self-hosted, và người dùng tự host tự chịu trách nhiệm về bảo mật, thời gian hoạt động và tính toàn vẹn của dữ liệu.

Trang giá được host cũng liệt kê các tính năng trả phí và Enterprise cho Trigger.dev Cloud:

- **Độ đồng thời cao hơn:** Gói miễn phí bao gồm 20 lượt chạy đồng thời, Hobby bao gồm 50, Pro bao gồm hơn 200, và Enterprise là tùy chỉnh.
- **Nhiều thành viên đội ngũ hơn:** Miễn phí và Hobby bao gồm 5 thành viên, Pro bao gồm hơn 25, và Enterprise là tùy chỉnh.
- **Preview branches:** Gói miễn phí bao gồm các nhánh preview, Hobby bao gồm 5, Pro bao gồm hơn 20, và Enterprise là tùy chỉnh.
- **Custom dashboards:** Gói miễn phí bao gồm các dashboard tùy chỉnh, Hobby bao gồm 1, Pro bao gồm 5, và Enterprise là tùy chỉnh.
- **Schedules:** Gói miễn phí bao gồm 10 schedule, Hobby bao gồm 100, Pro bao gồm hơn 1.000, và Enterprise là tùy chỉnh.
- **Lưu giữ log:** Gói miễn phí bao gồm 1 ngày, Hobby bao gồm 7 ngày, Pro bao gồm 30 ngày, và Enterprise hỗ trợ lưu giữ tùy chỉnh.
- **Hỗ trợ Slack chuyên dụng:** Được bao gồm trên gói Pro.
- **Hỗ trợ ưu tiên:** Được bao gồm trên gói Enterprise.
- **Role-based access control:** Được liệt kê là một tính năng Enterprise.
- **SSO:** Được liệt kê là một tính năng Enterprise.
- **Báo cáo SOC 2:** Được liệt kê là một tính năng Enterprise.

### Các gói self-hosted trả phí

| Gói | PTOps | Trigger.dev |
|------|-------|-------------|
| **Self-hosted miễn phí** | Tất cả tính năng của ứng dụng, hỗ trợ cộng đồng, mã nguồn mở BSD-3-Clause | Triển khai self-hosted Apache-2.0, các giới hạn có thể cấu hình, hỗ trợ qua cộng đồng Discord |
| **Self-hosted cấp trung** | Professional Support: $200/tháng, tất cả tính năng của ứng dụng, hệ thống ticket riêng tư, thời gian phản hồi trong 24 giờ | Không công bố cho self-hosting; gói Pro được host bắt đầu từ $50/tháng cộng với mức sử dụng và tiện ích bổ sung |
| **Self-hosted Enterprise** | Enterprise Support: $1,000/tháng, tất cả tính năng của ứng dụng, thiết lập/hỗ trợ SSO, hỗ trợ cài đặt air-gapped, hệ thống ticket riêng tư, phản hồi trong 1 giờ, live chat | Không công bố cho self-hosting; Enterprise Cloud là liên hệ bộ phận bán hàng |

Giá công khai của Trigger.dev chủ yếu dành cho sản phẩm Cloud được host. Self-hosting có sẵn theo giấy phép mã nguồn mở, nhưng hỗ trợ chuyên dụng, tự động mở rộng quy mô được quản lý, warm start, và checkpoint chỉ dành cho Cloud theo tài liệu self-hosting. PTOps công bố giá hỗ trợ cố định và không đặt các tính năng của ứng dụng đằng sau các cấp độ trả phí.

### So sánh hỗ trợ

| Kênh hỗ trợ | PTOps | Trigger.dev |
|--------------|-------|-------------|
| **Trợ giúp từ cộng đồng** | GitHub Discussions, GitHub Issues cho bug, Reddit, Discord, video, tài liệu | Cộng đồng Discord, GitHub issues, tài liệu |
| **Hỗ trợ trả phí không thuộc enterprise** | Gói Professional bao gồm hệ thống ticket riêng tư và thời gian phản hồi trong 24 giờ | Gói Pro được host bao gồm hỗ trợ Slack chuyên dụng; không có gói hỗ trợ self-hosted được công bố |
| **Hỗ trợ Enterprise** | Gói Enterprise bao gồm hệ thống ticket riêng tư, thời gian phản hồi trong 1 giờ, live chat, thiết lập/hỗ trợ SSO, và hỗ trợ cài đặt air-gapped | Enterprise Cloud bao gồm hỗ trợ ưu tiên; hỗ trợ chuyên dụng self-hosted không được liệt kê là một cấp công khai tiêu chuẩn |
| **Giá self-hosted được công bố** | $200/tháng cho gói Professional, $1,000/tháng cho gói Enterprise | Không công bố |

Tài liệu tự host của Trigger.dev cho biết hỗ trợ chuyên dụng có sẵn trên Cloud chứ không có trên self-hosted. PTOps cung cấp một lộ trình chỉ dành cho hỗ trợ cho người dùng self-hosted: hỗ trợ Professional ở mức $200/tháng, và hỗ trợ Enterprise ở mức $1,000/tháng với phản hồi nhanh hơn, live chat, hỗ trợ/thiết lập SSO, và hỗ trợ cài đặt air-gapped.

### Phạm vi vận hành

| Khả năng | PTOps | Trigger.dev |
|------------|-------|-------------|
| **Job chạy ngầm** | Có, thông qua event, job, plugin, action, API, và workflow | Có, đây là thế mạnh cốt lõi của Trigger.dev |
| **Mô hình lập trình** | Plugin và job có thể chạy các script hoặc chương trình tùy ý trên các server đích | Các task được viết trong code ứng dụng bằng cách sử dụng các SDK Trigger.dev và được triển khai dưới dạng các bundle task |
| **Workflow trực quan** | Có, với các node trigger, event, job, action, limit, controller, và note | Không phải là mô hình biên soạn chính; các task và workflow được biên soạn trong code |
| **Lập lịch job** | Bộ lập lịch native với các tùy chọn thủ công, schedule, interval, single-shot, plugin, catch-up, blackout, precision, range, và delay | Các task được lập lịch, lượt chạy bị trì hoãn, chờ (wait), và các job được trigger bằng code |
| **Kiểm soát luồng** | Các controller workflow, limit, queue, độ đồng thời, thử lại, lựa chọn target, và trọng số job của server | Hàng đợi, độ đồng thời, thử lại, trì hoãn, chờ, idempotency key, độ ưu tiên, TTL, trigger hàng loạt (batch triggering), và hủy lượt chạy |
| **Thực thi job fleet-aware** | Các server group native, target expression, thuật toán lựa chọn server, trọng số job, độ đồng thời trên mỗi server, và worker satellite | Webapp và worker self-hosted có thể mở rộng quy mô riêng biệt, nhưng Trigger.dev không tập trung vào kho kiểm kê server và lựa chọn target dựa trên sức khỏe |
| **Agent / runner từ xa** | xySat là một runner job từ xa và bộ thu thập metric không có dependency, được cài đặt bằng một lệnh như một dịch vụ trên Linux, Windows, macOS, hoặc Docker | Không có agent gọn nhẹ trên host. Trigger.dev self-hosted chạy các thành phần webapp, supervisor, và worker trong Docker hoặc Kubernetes; các tính năng chỉ dành cho Cloud bao gồm tự động mở rộng quy mô và checkpoint |
| **Monitor server** | Các monitor native, biểu đồ time-series, chế độ xem thời gian thực, plugin monitor tùy chỉnh, metric trên mỗi server và mỗi group | Quan sát và giám sát cho các lượt chạy task, trace, dashboard và log, nhưng không phải là một nền tảng monitor server tổng quát |
| **Alerting** | Định nghĩa alert native trên dữ liệu server trực tiếp, với các action fire/clear, snapshot, ticket, kiểm soát giới hạn job và hủy job | Các điểm đến alert là một phần của các gói được host; alert self-hosted có giới hạn cứng cao, nhưng đây là alert về task/lượt chạy chứ không phải alert cơ sở hạ tầng rộng rãi |
| **Ticket sự cố** | Hệ thống ticket native liên kết với job, alert, file, bình luận, ngày hết hạn, và event có thể chạy được | Không phải là hệ thống ticket sự cố tích hợp sẵn |
| **Snapshot** | Snapshot server/group tại một thời điểm native cho ngữ cảnh pháp lý và action alert | Không thể so sánh vì không có hệ thống snapshot server native |
| **Secret** | Được mã hóa khi lưu trữ, gán cho event, category, plugin, và webhook, phân phối khi runtime dưới dạng biến môi trường hoặc template | Các biến môi trường và pattern cấu hình triển khai cho các task và worker |
| **SSO** | Được bao gồm trong ứng dụng mã nguồn mở, với các pattern SSO trusted-header và hướng dẫn thiết lập | Được liệt kê là một tính năng của Enterprise Cloud |
| **Role và permission** | Được bao gồm trong ứng dụng mã nguồn mở, với privilege, role, giới hạn category, và giới hạn group | Kiểm soát truy cập dựa trên vai trò (RBAC) được liệt kê như một tính năng của Enterprise Cloud |
| **Cài đặt air-gapped** | Được hỗ trợ bởi tài liệu, và hỗ trợ Enterprise bao gồm hỗ trợ cài đặt air-gapped | Có sẵn self-hosting, nhưng người dùng tự chịu trách nhiệm về bảo mật, thời gian hoạt động, mở rộng quy mô và độ tin cậy |

### Trường hợp sử dụng hợp lý

Chọn **Trigger.dev** khi vấn đề chính là thực thi nền đáng tin cậy bên trong codebase ứng dụng: các task AI chạy lâu, workflow sản phẩm, job serverless không bị timeout, các task được lập lịch, thử lại, hàng đợi, chờ, và cập nhật trạng thái frontend theo thời gian thực.

Chọn **PTOps** khi vấn đề chính là vận hành cả cơ sở hạ tầng và các workflow production cùng nhau: lập lịch job trên các server, chọn các target khỏe mạnh, xem metric server trực tiếp, kích hoạt alert, đính kèm snapshot, mở ticket, và chạy các job khắc phục sự cố từ cùng một hệ thống.

### Điểm mấu chốt chính

- Trigger.dev là một framework job chạy ngầm mã nguồn mở mạnh mẽ dành cho lập trình viên, đặc biệt cho các task ứng dụng chạy lâu, các agent AI, lịch trình, thử lại, hàng đợi, chờ và cập nhật task thời gian thực.
- Tự host Trigger.dev có sẵn theo Apache-2.0, nhưng các tính năng chỉ dành cho Cloud bao gồm warm start, tự động mở rộng quy mô, checkpoint, và hỗ trợ chuyên dụng.
- PTOps bao gồm tất cả tính năng của ứng dụng trong phiên bản mã nguồn mở, bao gồm SSO, role, workflow, monitor, alert, ticket, plugin, webhook, bucket, secret, snapshot, và lập lịch fleet-aware.
- Trigger.dev là một sự lựa chọn phù hợp hơn khi workflow thuộc về bên trong codebase ứng dụng và nên được triển khai cùng với code đó.
- PTOps có lợi thế khi nền tảng tự động hóa cũng phải là nền tảng monitor, alert, ticket sự cố, snapshot và khắc phục sự cố.
- Gói Pro được host của Trigger.dev bắt đầu từ $50/tháng cộng với mức sử dụng và tiện ích bổ sung, trong khi giá hỗ trợ self-hosted không được công bố. PTOps công bố giá hỗ trợ ở mức $200/tháng cho gói Professional và $1,000/tháng cho gói Enterprise, và không hạn chế các tính năng của ứng dụng đằng sau các cấp độ trả phí.

### Nguồn tham khảo

- [Trigger.dev Pricing](https://trigger.dev/pricing)
- [Trigger.dev Self-hosting Overview](https://trigger.dev/docs/self-hosting/overview)
- [Trigger.dev Docker Compose Self-hosting](https://trigger.dev/docs/self-hosting/docker)
- [Trigger.dev Kubernetes Self-hosting](https://trigger.dev/docs/self-hosting/kubernetes)
- [Trigger.dev Docs](https://trigger.dev/docs)
- [Trigger.dev Runs](https://trigger.dev/docs/runs)
- [Trigger.dev Concurrency and Queues](https://trigger.dev/docs/writing-tasks-concurrency-and-queues)
- [Trigger.dev Errors and Retrying](https://trigger.dev/docs/writing-tasks-errors-retrying)
- [Trigger.dev Alerts](https://trigger.dev/docs/alerts)
- [Trigger.dev License](https://github.com/triggerdotdev/trigger.dev/blob/main/LICENSE)
## Prefect

Bản so sánh này tập trung vào **self-hosted Prefect** so với **self-hosted PTOps**. Thông tin nghiên cứu được kiểm tra lần cuối vào **ngày 4 tháng 5 năm 2026**.

Prefect là một nền tảng điều phối workflow Python mã nguồn mở Apache-2.0. Nó được xây dựng xung quanh các hàm Python được decorate dưới dạng flow và task, với theo dõi trạng thái, thử lại (retry), triển khai (deployment), work pool, worker, tự động hóa (automation), log và UI. Nó đặc biệt mạnh mẽ cho kỹ thuật dữ liệu (data engineering), workflow ML, tự động hóa Python, các task chạy ngầm, và các đội ngũ muốn điều phối nằm gần code Python.

PTOps chồng lấp với Prefect xung quanh các workflow, lập lịch, event, thử lại, độ đồng thời, worker, log, metric, API, và self-hosting. Sự khác biệt là phạm vi vận hành. Prefect chủ yếu là một bộ điều phối workflow Python và control plane tự động hóa dữ liệu/platform. PTOps là một nền tảng vận hành kết hợp tự động hóa job và workflow với monitor server, alert, snapshot, ticket sự cố, nhắm mục tiêu server và các workflow khắc phục sự cố.

### Phân vị trí (Positioning)

| Lĩnh vực | PTOps | Prefect |
|------|-------|---------|
| **Phân loại chính** | Nền tảng ops hoàn chỉnh: lập lịch, workflow, monitor, alert, ticket, phản hồi sự cố | Điều phối workflow Python và tự động hóa dữ liệu/platform |
| **Self-hosting** | Có | Có |
| **Cloud hosting** | Không | Có |
| **Mô hình bản quyền** | Mã nguồn mở BSD-3-Clause, bao gồm tất cả tính năng của ứng dụng | Mã nguồn mở Apache-2.0, cùng với các dịch vụ Cloud và Customer Managed thương mại |
| **Các gói trả phí** | Đăng ký chỉ dành cho hỗ trợ (support) | Các gói được host, các tính năng Enterprise, và tùy chọn tự host Customer Managed |
| **Phù hợp nhất cho** | Đội ngũ ops muốn tự động hóa, nhận biết server, alert, ticket và runbook ở một nơi | Đội ngũ Python/dữ liệu/platform muốn điều phối ưu tiên code với các tùy chọn control plane được quản lý hoặc tự host |

### Mô hình tính năng

Gói miễn phí của PTOps bao gồm tất cả tính năng của ứng dụng, và các gói Professional và Enterprise trả phí chỉ bổ sung các dịch vụ hỗ trợ, chứ không thêm khả năng sản phẩm. Điều này bao gồm workflow, lập lịch, SSO, user, role, secret, plugin, webhook, monitor, alert, snapshot, ticket, bucket, API và thực thi fleet-aware.

Prefect Open Source có thể tự host và được cấp phép Apache-2.0. Tài liệu của Prefect mô tả một server Prefect tự host được hỗ trợ bởi cơ sở dữ liệu và UI. Server lưu trữ trạng thái chạy flow và chạy task, lịch sử chạy, log, deployment, giới hạn độ đồng thời, block lưu trữ, biến, artifact, trạng thái work pool, event và tự động hóa. SQLite là cơ sở dữ liệu mặc định gọn nhẹ, và PostgreSQL được khuyến nghị cho production, high availability, và triển khai multi-server.

Prefect Cloud và server Prefect self-hosted chia sẻ một bộ khả năng chung, nhưng tài liệu của Prefect nói rằng Cloud cung cấp các tính năng tổ chức bổ sung như RBAC, audit log, và SSO. Trang so sánh Prefect Cloud so với OSS cũng xác định Cloud là lựa chọn phù hợp hơn cho các tổ chức cần bảo mật enterprise như SSO, RBAC, và audit log.

Trang giá công khai của Prefect liệt kê các tính năng này là tính năng trả phí hoặc Enterprise/Customer Managed:

- **User và workspace:** Gói Hobby bị giới hạn ở 2 user và 1 workspace; các gói Cloud cao hơn tăng số lượng user và workspace.
- **Deployments:** Hobby bao gồm 5 deployment, Starter bao gồm 20, Team bao gồm 100, Pro bao gồm 1.000, và Enterprise/Customer Managed là không giới hạn.
- **Custom work pools:** Được liệt kê trong các gói trả phí để tự mang theo tài nguyên tính toán và kiểm soát cơ sở hạ tầng của riêng bạn.
- **Webhooks:** Được bao gồm ngoài gói Hobby.
- **Service accounts:** Được liệt kê trong gói Team và cao hơn.
- **Automations:** Gói Hobby bao gồm 5 tự động hóa, Team bao gồm 50, và các gói cao hơn tăng giới hạn này.
- **SSO:** Được liệt kê cho gói Pro và cao hơn.
- **Basic RBAC:** Được liệt kê cho gói Pro.
- **RBAC và ACL:** Được liệt kê cho Enterprise và Customer Managed.
- **Directory Sync / SCIM:** Được liệt kê cho Enterprise và Customer Managed.
- **Thời gian lưu giữ audit log:** Gói Hobby không có, Team có thời gian lưu giữ audit log trong 24 giờ, và các gói cao hơn mở rộng các tính năng quản trị này.
- **IP allowlisting và PrivateLink:** Được liệt kê cho Enterprise và Customer Managed.
- **Lưu giữ lượt chạy (Run retention):** Gói Hobby liệt kê 7 ngày, với thời gian lưu giữ lâu hơn trên các gói trả phí.
- **Giới hạn tỷ lệ API (API rate limits):** Gói Hobby liệt kê 625 yêu cầu/phút, Starter liệt kê 1.250 yêu cầu/phút, và giới hạn Enterprise là tùy chỉnh.
- **Uptime SLA:** Không bao gồm trong gói Hobby; các gói cao hơn bổ sung dịch vụ được hỗ trợ bởi SLA.
- **Kênh hỗ trợ:** Hobby sử dụng hỗ trợ từ cộng đồng; các gói trả phí bổ sung các kênh hỗ trợ thương mại.
- **Customer Managed:** Prefect tự host để kiểm soát tối đa và tuân thủ, bao gồm triển khai on-premises hoặc air-gapped, chủ quyền dữ liệu hoàn toàn và cách ly mạng, triển khai sẵn sàng tuân thủ, và trải nghiệm triển khai hỗ trợ tận tình.

### Các gói self-hosted trả phí

| Gói | PTOps | Prefect |
|------|-------|---------|
| **Self-hosted miễn phí** | Tất cả tính năng của ứng dụng, hỗ trợ cộng đồng, mã nguồn mở BSD-3-Clause | Prefect Open Source, Apache-2.0, server và UI tự host, hỗ trợ từ cộng đồng |
| **Self-hosted cấp trung** | Professional Support: $200/tháng, tất cả tính năng của ứng dụng, hệ thống ticket riêng tư, thời gian phản hồi trong 24 giờ | Không công bố cho Open Source self-hosted; gói Starter được host là $100/tháng và Team được host là $100/user/tháng |
| **Self-hosted Enterprise** | Enterprise Support: $1,000/tháng, tất cả tính năng của ứng dụng, thiết lập/hỗ trợ SSO, hỗ trợ cài đặt air-gapped, hệ thống ticket riêng tư, phản hồi trong 1 giờ, live chat | Customer Managed, liên hệ bộ phận bán hàng, Prefect self-hosted với các tính năng Enterprise, hỗ trợ triển khai, tuân thủ và hỗ trợ kỹ thuật |

Prefect công bố giá Cloud được host cho các gói Hobby, Starter, Team, Pro, và Enterprise, và liệt kê Customer Managed dưới dạng tùy chọn tự host có giá tùy chỉnh. PTOps công bố giá hỗ trợ cố định và không đặt các tính năng của ứng dụng đằng sau các gói trả phí.

### So sánh hỗ trợ

| Kênh hỗ trợ | PTOps | Prefect |
|--------------|-------|---------|
| **Trợ giúp từ cộng đồng** | GitHub Discussions, GitHub Issues cho bug, Reddit, Discord, video, tài liệu | Hỗ trợ từ cộng đồng, GitHub, tài nguyên Slack/cộng đồng, tài liệu |
| **Hỗ trợ trả phí không thuộc enterprise** | Gói Professional bao gồm hệ thống ticket riêng tư và thời gian phản hồi trong 24 giờ | Các gói Cloud trả phí bao gồm các đường dẫn hỗ trợ thương mại; không công bố gói hỗ trợ Open Source self-hosted |
| **Hỗ trợ Enterprise** | Gói Enterprise bao gồm hệ thống ticket riêng tư, thời gian phản hồi trong 1 giờ, live chat, thiết lập/hỗ trợ SSO, và hỗ trợ cài đặt air-gapped | Các gói Enterprise và Customer Managed là các gói dịch vụ liên hệ bộ phận bán hàng với các tùy chọn quản trị, quy mô, hỗ trợ và triển khai tận tình |
| **Giá self-hosted được công bố** | $200/tháng cho gói Professional, $1,000/tháng cho gói Enterprise | Liên hệ bộ phận bán hàng cho Customer Managed |

Server mã nguồn mở của Prefect được tự do self-host, trong khi hỗ trợ thương mại và quản trị enterprise chủ yếu được đóng gói thông qua Prefect Cloud và Customer Managed. PTOps sử dụng mô hình chỉ dành cho hỗ trợ cho người dùng self-hosted: Hỗ trợ Professional ở mức $200/tháng, và hỗ trợ Enterprise ở mức $1,000/tháng với phản hồi nhanh hơn, live chat, hỗ trợ/thiết lập SSO, và hỗ trợ cài đặt air-gapped.

### Phạm vi vận hành

| Khả năng | PTOps | Prefect |
|------------|-------|---------|
| **Điều phối workflow** | Có, thông qua workflow trực quan, job, action, limit, và plugin | Có, đây là thế mạnh cốt lõi của Prefect |
| **Mô hình lập trình** | Plugin và job có thể chạy các script hoặc chương trình tùy ý trên các server đích | Các flow và task Python sử dụng decorator, deployment, và work pool |
| **Workflow trực quan** | Có, với các node trigger, event, job, action, limit, controller, và note | Prefect có một UI cho các lượt chạy, deployment, tự động hóa và observability, nhưng các workflow được biên soạn chủ yếu bằng Python |
| **Lập lịch job** | Bộ lập lịch native với các tùy chọn thủ công, schedule, interval, single-shot, plugin, catch-up, blackout, precision, range, và delay | Các deployment có thể chạy thủ công, theo lịch trình, hoặc để phản hồi các event và tự động hóa |
| **Kiểm soát luồng** | Các controller workflow, limit, queue, độ đồng thời, thử lại, lựa chọn target, và trọng số job của server | Thử lại, timeout, trạng thái, cache, giới hạn độ đồng thời toàn cục và dựa trên thẻ (tag), hàng đợi công việc, worker và tự động hóa |
| **Thực thi job fleet-aware** | Các server group native, target expression, thuật toán lựa chọn server, trọng số job, độ đồng thời trên mỗi server, và worker satellite | Các work pool và worker định tuyến các flow đến cơ sở hạ tầng như process, Docker, Kubernetes, ECS, Cloud Run, Vertex AI, Azure Container Instances, và các dịch vụ khác |
| **Agent / runner từ xa** | xySat là một runner job từ xa và bộ thu thập metric không có dependency, được cài đặt bằng một lệnh như một dịch vụ trên Linux, Windows, macOS, hoặc Docker | Các worker Prefect là các tiến trình Python mã nguồn mở thăm dò các work pool và chạy ở bất cứ nơi nào Python và cơ sở hạ tầng được chọn có sẵn; quyền truy cập worker không được trình bày như một tính năng Enterprise riêng biệt trong tài liệu công khai |
| **Monitor server** | Các monitor native, biểu đồ time-series, chế độ xem thời gian thực, plugin monitor tùy chỉnh, metric trên mỗi server và mỗi group | Trạng thái worker, log lượt chạy, event, metric, và observability trên Cloud, nhưng không phải là một nền tảng monitor server tổng quát |
| **Alerting** | Định nghĩa alert native trên dữ liệu server trực tiếp, với các action fire/clear, snapshot, ticket, kiểm soát giới hạn job và hủy job | Tự động hóa có thể kích hoạt thông báo và hành động từ các event flow, deployment, work pool, hàng đợi công việc, và metric, nhưng đây là alert về workflow chứ không phải alert cơ sở hạ tầng rộng rãi |
| **Ticket sự cố** | Hệ thống ticket native liên kết với job, alert, file, bình luận, ngày hết hạn, và event có thể chạy được | Không phải là hệ thống ticket sự cố tích hợp sẵn |
| **Snapshot** | Snapshot server/group tại một thời điểm native cho ngữ cảnh pháp lý và action alert | Không thể so sánh vì không có hệ thống snapshot server native |
| **Secret** | Được mã hóa khi lưu trữ, gán cho event, category, plugin, và webhook, phân phối khi runtime dưới dạng biến môi trường hoặc template | Các block, biến, cấu hình work pool, và các pattern bảo mật Cloud/service-account |
| **SSO** | Được bao gồm trong ứng dụng mã nguồn mở, với các pattern SSO trusted-header và hướng dẫn thiết lập | Tính năng Prefect Cloud Pro/Enterprise và Customer Managed |
| **Role và permission** | Được bao gồm trong ứng dụng mã nguồn mở, với privilege, role, giới hạn category, và giới hạn group | Prefect Cloud bổ sung RBAC cơ bản trên gói Pro và RBAC cộng với ACL trên Enterprise/Customer Managed |
| **Cài đặt air-gapped** | Được hỗ trợ bởi tài liệu, và hỗ trợ Enterprise bao gồm hỗ trợ cài đặt air-gapped | Prefect OSS có thể tự host; Customer Managed bao gồm hỗ trợ triển khai on-premises và air-gapped |

### Trường hợp sử dụng hợp lý

Chọn **Prefect** khi vấn đề chính là điều phối workflow Python cho các data pipeline, workflow ML, job phân tích, xử lý chạy ngầm, hoặc tự động hóa platform, đặc biệt khi các đội ngũ muốn có flow ưu tiên code, work pool, worker, và hệ sinh thái Python trưởng thành.

Chọn **PTOps** khi vấn đề chính là vận hành cả cơ sở hạ tầng và các workflow production cùng nhau: lập lịch job trên các server, chọn các target khỏe mạnh, xem metric server trực tiếp, kích hoạt alert, đính kèm snapshot, mở ticket, và chạy các job khắc phục sự cố từ cùng một hệ thống.

### Điểm mấu chốt chính

- Prefect là một bộ điều phối workflow Python mã nguồn mở Apache-2.0 mạnh mẽ với server mã nguồn mở trưởng thành và các tùy chọn Cloud/Customer Managed.
- Prefect Cloud và Customer Managed bổ sung các tính năng quản trị enterprise như SSO, RBAC, audit log, SCIM, IP allowlisting, PrivateLink, hỗ trợ kỹ thuật, và triển khai được quản lý hoặc hỗ trợ.
- PTOps bao gồm tất cả tính năng của ứng dụng trong phiên bản mã nguồn mở, bao gồm SSO, role, workflow, monitor, alert, ticket, plugin, webhook, bucket, secret, snapshot, và lập lịch fleet-aware.
- Prefect là một sự lựa chọn phù hợp hơn cho các workflow dữ liệu, ML, phân tích và platform ưu tiên Python.
- PTOps có lợi thế khi nền tảng tự động hóa cũng phải là nền tảng monitor, alert, ticket sự cố, snapshot và khắc phục sự cố.
- Giá Prefect Customer Managed là liên hệ bộ phận bán hàng, trong khi PTOps công bố giá hỗ trợ ở mức $200/tháng cho gói Professional và $1,000/tháng cho gói Enterprise, và không hạn chế các tính năng của ứng dụng đằng sau các cấp độ trả phí.

### Nguồn tham khảo

- [Prefect Pricing](https://www.prefect.io/pricing)
- [Prefect Cloud vs Open Source](https://www.prefect.io/compare/prefect-oss)
- [Prefect Open Source](https://www.prefect.io/opensource)
- [Prefect Server](https://docs.prefect.io/v3/concepts/server)
- [Prefect Flows](https://docs.prefect.io/v3/concepts/flows)
- [Prefect Workers](https://docs.prefect.io/v3/deploy/infrastructure-concepts/workers)
- [Prefect Automations](https://docs.prefect.io/v3/concepts/automations)
- [Prefect Webhooks](https://docs.prefect.io/latest/guides/webhooks)
- [Prefect Audit Logs](https://docs.prefect.io/v3/how-to-guides/cloud/manage-users/audit-logs)
- [Prefect License](https://github.com/PrefectHQ/prefect/blob/main/LICENSE)

## Make

Bản so sánh này tập trung vào **Make** so với **self-hosted PTOps**. Thông tin nghiên cứu được kiểm tra lần cuối vào **ngày 4 tháng 5 năm 2026**.

Make là một nền tảng tự động hóa trực quan dựa trên đám mây để kết nối các ứng dụng, xây dựng scenario, điều phối các quy trình kinh doanh và bổ sung tự động hóa hướng AI giữa các đội ngũ. Nó đặc biệt mạnh mẽ đối với tự động hóa SaaS no-code và low-code, với danh mục tích hợp lớn, trình xây dựng scenario trực quan trau chuốt, template, kết nối ứng dụng, router, bộ lọc, và các tính năng cộng tác nhóm.

PTOps chồng lấp với Make xung quanh tự động hóa workflow, lập lịch, webhook, logic có điều kiện, tích hợp, log thực thi và tự động hóa dựa trên API. Sự khác biệt là cách thức triển khai và phạm vi vận hành. Make là một nền tảng tự động hóa SaaS được host. PTOps là một nền tảng vận hành self-hosted kết hợp tự động hóa workflow với monitor server, alert, snapshot, ticket sự cố, nhắm mục tiêu server và các workflow khắc phục sự cố.

### Phân vị trí (Positioning)

| Lĩnh vực | PTOps | Make |
|------|-------|------|
| **Phân loại chính** | Nền tảng ops hoàn chỉnh: lập lịch, workflow, monitor, alert, ticket, phản hồi sự cố | Nền tảng tự động hóa trực quan và tích hợp dựa trên đám mây |
| **Self-hosting** | Có | Không |
| **Cloud hosting** | Không | Có |
| **Mô hình bản quyền** | Mã nguồn mở BSD-3-Clause, bao gồm tất cả tính năng của ứng dụng | SaaS độc quyền |
| **Các gói trả phí** | Đăng ký chỉ dành cho hỗ trợ (support) | Các gói SaaS dựa trên credit, tính năng, và hỗ trợ Enterprise |
| **Phù hợp nhất cho** | Đội ngũ ops muốn tự động hóa, nhận biết server, alert, ticket và runbook ở một nơi | Đội ngũ muốn tự động hóa trực quan no-code/low-code trên các ứng dụng SaaS và các hệ thống kinh doanh |

### Mô hình tính năng

Gói miễn phí của PTOps bao gồm tất cả tính năng của ứng dụng, và các gói Professional và Enterprise trả phí chỉ bổ sung các dịch vụ hỗ trợ, chứ không thêm khả năng sản phẩm. Điều này bao gồm workflow, lập lịch, SSO, user, role, secret, plugin, webhook, monitor, alert, snapshot, ticket, bucket, API và thực thi fleet-aware.

Make là một sản phẩm SaaS được host. Trang giá của nó liệt kê các gói dựa trên lượng credit hàng tháng, với credit được tiêu thụ bởi các hành động mô-đun trong scenario. Hàng lưu trữ của Make liệt kê AWS ở EU và Bắc Mỹ, và bài viết cloud-so-với-self-hosted định nghĩa Make là cách tiếp cận tự động hóa dựa trên đám mây. Make cũng cung cấp một agent on-prem Enterprise, nhưng agent này dùng để truy cập an toàn vào mạng cục bộ và các ứng dụng cốt lõi của doanh nghiệp từ Make. Đây không phải là một bản triển khai Make tự chạy self-hosted.

Trang giá công khai của Make liệt kê các giới hạn gói và tính năng trả phí này:

- **Credits:** Gói miễn phí bao gồm tối đa 1.000 credit/tháng. Các gói trả phí tăng quy mô theo lượng credit hàng tháng được chọn.
- **Giá trả phí cơ bản:** Core bắt đầu từ $12/tháng, Pro bắt đầu từ $21/tháng, và Teams bắt đầu từ $38/tháng cho 10.000 credit/tháng. Enterprise có giá tùy chỉnh.
- **Active scenarios:** Gói miễn phí bị giới hạn ở 2 scenario hoạt động; các gói trả phí không giới hạn scenario hoạt động.
- **Khoảng thời gian lập lịch:** Gói miễn phí có khoảng thời gian tối thiểu là 15 phút; các gói trả phí hỗ trợ lập lịch xuống tới 1 phút.
- **Thời gian thực thi scenario:** Gói miễn phí liệt kê thời gian thực thi tối đa là 5 phút; các gói trả phí liệt kê 40 phút.
- **Lưu trữ log thực thi:** Gói miễn phí liệt kê 7 ngày, hầu hết các gói trả phí liệt kê 30 ngày, và Enterprise liệt kê 60 ngày.
- **Quyền truy cập API:** Core và cao hơn bao gồm quyền truy cập vào API Make, với giới hạn tỷ lệ cao hơn trên các gói cao hơn.
- **Thực thi ưu tiên:** Pro và cao hơn bao gồm thực thi scenario ưu tiên.
- **Custom variables:** Pro và cao hơn bao gồm biến tùy chỉnh.
- **Tìm kiếm toàn văn log thực thi:** Pro và cao hơn bao gồm tìm kiếm toàn văn log thực thi.
- **Team và vai trò của team:** Các gói Teams và Enterprise bao gồm các tính năng cộng tác và vai trò của team.
- **Scenario templates:** Gói Teams và Enterprise có thể tạo và chia sẻ scenario template.
- **Custom functions:** Enterprise bao gồm hỗ trợ hàm tùy chỉnh.
- **Tích hợp ứng dụng Enterprise:** Enterprise bao gồm quyền truy cập vào các ứng dụng enterprise quan trọng.
- **Agent on-prem:** Enterprise bao gồm một agent on-prem để truy cập an toàn vào mạng cục bộ từ Make.
- **Analytics dashboards:** Enterprise bao gồm các dashboard phân tích.
- **Audit logs:** Enterprise bao gồm audit log cho các hành động của user.
- **SSO của công ty:** Enterprise bao gồm SSO tương thích OAuth2 hoặc SAML2.
- **Domain claim:** Enterprise cho phép xác nhận quyền sở hữu domain của công ty.
- **Overage protection:** Enterprise bao gồm bảo vệ quá hạn credit.
- **Các tính năng bảo mật nâng cao:** Enterprise bao gồm các kiểm soát bảo mật nâng cao.
- **Hỗ trợ Enterprise 24/7:** Enterprise bao gồm hỗ trợ ưu tiên hàng đầu 24/7 từ các chuyên gia cao cấp.
- **Đội ngũ Value Engineering:** Enterprise bao gồm quyền truy cập vào hướng dẫn chiến lược từ đội ngũ Value Engineering của Make.

### Các gói trả phí

| Gói | PTOps | Make |
|------|-------|------|
| **Miễn phí** | Tất cả tính năng của ứng dụng, hỗ trợ cộng đồng, mã nguồn mở BSD-3-Clause, tự chạy self-hosted | Gói SaaS miễn phí, lên đến 1.000 credit/tháng, 2 scenario hoạt động, khoảng thời gian tối thiểu 15 phút |
| **Cấp trung** | Professional Support: $200/tháng, tất cả tính năng của ứng dụng, hệ thống ticket riêng tư, thời gian phản hồi trong 24 giờ | Core bắt đầu từ $12/tháng, Pro bắt đầu từ $21/tháng, Teams bắt đầu từ $38/tháng cho 10.000 credit/tháng |
| **Enterprise** | Enterprise Support: $1,000/tháng, tất cả tính năng của ứng dụng, thiết lập/hỗ trợ SSO, hỗ trợ cài đặt air-gapped, hệ thống ticket riêng tư, phản hồi trong 1 giờ, live chat | Enterprise SaaS, giá tùy chỉnh, bảo mật nâng cao, SSO, audit log, agent on-prem, hỗ trợ Enterprise 24/7 |

Make công bố giá SaaS tự phục vụ cho các gói Free, Core, Pro, và Teams, cộng với giá Enterprise tùy chỉnh. PTOps công bố giá hỗ trợ cố định cho các bản cài đặt self-hosted và không đo lường lượt thực thi workflow hay đặt các tính năng của ứng dụng đằng sau các gói trả phí.

### So sánh hỗ trợ

| Kênh hỗ trợ | PTOps | Make |
|--------------|-------|------|
| **Trợ giúp từ cộng đồng** | GitHub Discussions, GitHub Issues cho bug, Reddit, Discord, video, tài liệu | Cộng đồng Make, Trung tâm Trợ giúp, Academy, tài liệu |
| **Hỗ trợ trả phí không thuộc enterprise** | Gói Professional bao gồm hệ thống ticket riêng tư và thời gian phản hồi trong 24 giờ | Bảng giá liệt kê hỗ trợ khách hàng, hỗ trợ kỹ thuật từ đội ngũ chuyên gia của Make, và hướng dẫn ưu tiên cao trên các gói cao hơn |
| **Hỗ trợ Enterprise** | Gói Enterprise bao gồm hệ thống ticket riêng tư, thời gian phản hồi trong 1 giờ, live chat, thiết lập/hỗ trợ SSO, và hỗ trợ cài đặt air-gapped | Enterprise bao gồm hỗ trợ ưu tiên hàng đầu 24/7 từ các chuyên gia cao cấp và quyền truy cập vào đội ngũ Value Engineering |
| **Giá self-hosted được công bố** | $200/tháng cho gói Professional, $1,000/tháng cho gói Enterprise | Không có sản phẩm self-hosted |

Hỗ trợ của Make được liên kết với cấu trúc gói SaaS của nó. Hỗ trợ của PTOps được liên kết với triển khai self-hosted, và hỗ trợ trả phí không làm thay đổi bộ tính năng của ứng dụng.

### Phạm vi vận hành

| Khả năng | PTOps | Make |
|------------|-------|------|
| **Workflow trực quan** | Có, với các node trigger, event, job, action, limit, controller, và note | Có, đây là thế mạnh cốt lõi của Make |
| **Tích hợp ứng dụng** | Plugin, webhook, API, job shell, yêu cầu HTTP, và code tùy chỉnh | Hơn 3.000 ứng dụng được xây dựng sẵn, ứng dụng enterprise, ứng dụng tùy chỉnh, công cụ HTTP/API, và ứng dụng AI |
| **Mô hình lập trình** | Plugin và job có thể chạy các script hoặc chương trình tùy ý trên các server đích | Các scenario trực quan, mô-đun, router, bộ lọc, ứng dụng code JavaScript/Python tùy chỉnh, và các hàm tùy chỉnh trên Enterprise |
| **Lập lịch job** | Bộ lập lịch native với các tùy chọn thủ công, schedule, interval, single-shot, plugin, catch-up, blackout, precision, range, và delay | Scenario được lên lịch, trigger instant/app, webhook, và khoảng thời gian tối thiểu 1 phút trên các gói trả phí |
| **Kiểm soát luồng** | Các controller workflow, limit, queue, độ đồng thời, thử lại, lựa chọn target, và trọng số job của server | Router, bộ lọc, sub-scenario, đầu vào/đầu ra scenario, kết nối động, và các pattern rẽ nhánh trực quan |
| **Thực thi job fleet-aware** | Các server group native, target expression, thuật toán lựa chọn server, trọng số job, độ đồng thời trên mỗi server, và worker satellite | Không tập trung vào kho kiểm kê server hoặc lựa chọn target fleet-aware |
| **Agent / runner từ xa** | xySat là một runner job từ xa và bộ thu thập metric không có dependency, được cài đặt bằng một lệnh như một dịch vụ trên Linux, Windows, macOS, hoặc Docker | Không có runner self-hosted. Enterprise bao gồm một agent on-prem để kết nối mạng riêng tư với Make; bộ cài đặt có sẵn cho Windows Server và môi trường Linux/Mac và yêu cầu Java |
| **Monitor server** | Các monitor native, biểu đồ time-series, chế độ xem thời gian thực, plugin monitor tùy chỉnh, metric trên mỗi server và mỗi group | Giám sát thực thi scenario và phân tích thời gian thực, nhưng không phải là một nền tảng monitor server tổng quát |
| **Alerting** | Định nghĩa alert native trên dữ liệu server trực tiếp, với các action fire/clear, snapshot, ticket, kiểm soát giới hạn job và hủy job | Các lỗi scenario, thông báo, và pattern giám sát, nhưng không phải alert cơ sở hạ tầng rộng rãi |
| **Ticket sự cố** | Hệ thống ticket native liên kết với job, alert, file, bình luận, ngày hết hạn, và event có thể chạy được | Không phải là hệ thống ticket sự cố tích hợp sẵn |
| **Snapshot** | Snapshot server/group tại một thời điểm native cho ngữ cảnh pháp lý và action alert | Không thể so sánh vì không có hệ thống snapshot server native |
| **Secret** | Được mã hóa khi lưu trữ, gán cho event, category, plugin, và webhook, phân phối khi runtime dưới dạng biến môi trường hoặc template | Quản lý kết nối ứng dụng và credential bên trong Make |
| **SSO** | Được bao gồm trong ứng dụng mã nguồn mở, với các pattern SSO trusted-header và hướng dẫn thiết lập | Tính năng Enterprise |
| **Role và permission** | Được bao gồm trong ứng dụng mã nguồn mở, với privilege, role, giới hạn category, và giới hạn group | Các tính năng team và vai trò của team trên gói Teams/Enterprise, truy cập dựa trên vai trò và các tính năng quản trị trên Enterprise |
| **Cài đặt air-gapped** | Được hỗ trợ bởi tài liệu, và hỗ trợ Enterprise bao gồm hỗ trợ cài đặt air-gapped | Không có triển khai Make self-hosted hay air-gapped; agent on-prem Enterprise có thể truy cập mạng riêng tư từ nền tảng SaaS |

### Trường hợp sử dụng hợp lý

Chọn **Make** khi vấn đề chính là tự động hóa trực quan dựa trên đám mây trên các ứng dụng SaaS và các hệ thống kinh doanh, đặc biệt đối với các đội ngũ muốn có trình xây dựng no-code/low-code, hàng nghìn tích hợp ứng dụng, các workflow dựa trên template nhanh chóng, và cơ sở hạ tầng được host sẵn.

Chọn **PTOps** khi vấn đề chính là vận hành cả cơ sở hạ tầng và các workflow production cùng nhau: lập lịch job trên các server, chọn các target khỏe mạnh, xem metric server trực tiếp, kích hoạt alert, đính kèm snapshot, mở ticket, và chạy các job khắc phục sự cố từ cùng một hệ thống.

### Điểm mấu chốt chính

- Make là một nền tảng tự động hóa trực quan được host mạnh mẽ với danh mục ứng dụng SaaS lớn, trình dựng no-code/low-code thân thiện, và các tính năng quản trị Enterprise.
- Make không tự chạy self-hosted. Agent on-prem Enterprise của nó kết nối Make với mạng riêng tư, nhưng bản thân nền tảng Make vẫn được host.
- PTOps bao gồm tất cả tính năng của ứng dụng trong phiên bản mã nguồn mở, bao gồm SSO, role, workflow, monitor, alert, ticket, plugin, webhook, bucket, secret, snapshot, và lập lịch fleet-aware.
- Make là một sự lựa chọn phù hợp hơn cho tự động hóa ứng dụng kinh doanh, tích hợp SaaS, và các đội ngũ no-code/low-code muốn cơ sở hạ tầng được host sẵn.
- PTOps có lợi thế khi nền tảng tự động hóa phải tự chạy self-hosted và cũng phải là nền tảng monitor, alert, ticket sự cố, snapshot và khắc phục sự cố.
- Make Core bắt đầu từ $12/tháng cho 10.000 credit/tháng, Pro từ $21/tháng, Teams từ $38/tháng, và Enterprise là giá tùy chỉnh. PTOps công bố giá hỗ trợ ở mức $200/tháng cho gói Professional và $1,000/tháng cho gói Enterprise, và không đo lường các lượt thực thi workflow.

### Nguồn tham khảo

- [Make Pricing](https://www.make.com/en/pricing)
- [Make Enterprise](https://www.make.com/en/enterprise)
- [Make Cloud vs Self-Hosted Automation](https://www.make.com/en/blog/cloud-vs-self-hosted-automation)
- [Make On-Prem Agent Installers](https://www.make.com/en/on-prem-agents)
- [Make Help Center](https://help.make.com/)
- [Make Apps](https://www.make.com/en/integrations)
- [Make Security](https://www.make.com/en/security)

## Zapier

Bản so sánh này tập trung vào **Zapier** so với **self-hosted PTOps**. Thông tin nghiên cứu được kiểm tra lần cuối vào **ngày 4 tháng 5 năm 2026**.

Zapier là một nền tảng tự động hóa dựa trên đám mây để kết nối các ứng dụng, công cụ AI, dữ liệu, form, bảng, chatbot, agent và các workflow kinh doanh. Nó là một trong những sản phẩm nổi tiếng nhất trong danh mục tự động hóa, với hệ sinh thái ứng dụng rất lớn, trình dựng workflow thân thiện, các template, Zap nhiều bước, các path, bộ lọc, webhook, và các công cụ tự động hóa AI mới hơn.

PTOps chồng lấp với Zapier xung quanh tự động hóa workflow, lập lịch, webhook, logic có điều kiện, tích hợp, lịch sử thực thi và tự động hóa dựa trên API. Sự khác biệt là cách thức triển khai và phạm vi vận hành. Zapier là một nền tảng tự động hóa SaaS được host. PTOps là một nền tảng vận hành self-hosted kết hợp tự động hóa workflow với monitor server, alert, snapshot, ticket sự cố, nhắm mục tiêu server và các workflow khắc phục sự cố.

### Phân vị trí (Positioning)

| Lĩnh vực | PTOps | Zapier |
|------|-------|--------|
| **Phân loại chính** | Nền tảng ops hoàn chỉnh: lập lịch, workflow, monitor, alert, ticket, phản hồi sự cố | Tự động hóa ứng dụng dựa trên đám mây và nền tảng workflow AI |
| **Self-hosting** | Có | Không |
| **Cloud hosting** | Không | Có |
| **Mô hình bản quyền** | Mã nguồn mở BSD-3-Clause, bao gồm tất cả tính năng của ứng dụng | SaaS độc quyền |
| **Các gói trả phí** | Đăng ký chỉ dành cho hỗ trợ (support) | Các gói SaaS dựa trên task, tính năng, user, và hỗ trợ Enterprise |
| **Phù hợp nhất cho** | Đội ngũ ops muốn tự động hóa, nhận biết server, alert, ticket và runbook ở một nơi | Đội ngũ muốn tự động hóa được host trên các ứng dụng SaaS, công cụ AI, form, bảng và hệ thống kinh doanh |

### Mô hình tính năng

Gói miễn phí của PTOps bao gồm tất cả tính năng của ứng dụng, và các gói Professional và Enterprise trả phí chỉ bổ sung các dịch vụ hỗ trợ, chứ không thêm khả năng sản phẩm. Điều này bao gồm workflow, lập lịch, SSO, user, role, secret, plugin, webhook, monitor, alert, snapshot, ticket, bucket, API và thực thi fleet-aware.

Zapier là một sản phẩm SaaS được host. Trang giá công khai của nó tổ chức các gói xung quanh khối lượng task hàng tháng, các cấp tính năng, mức độ hỗ trợ, và quản trị nhóm/enterprise. Zapier không cung cấp sản phẩm Zapier self-hosted.

Các tài liệu giá công khai và tài liệu Enterprise của Zapier liệt kê các giới hạn gói và tính năng trả phí này:

- **Tasks:** Gói miễn phí bao gồm tối đa 100 task/tháng. Các gói trả phí tăng quy mô theo khối lượng task hàng tháng được chọn.
- **Giá trả phí cơ bản:** Professional bắt đầu từ $29.99/tháng cho 750 task/tháng. Team bắt đầu từ $103.50/tháng cho 2.000 task/tháng. Enterprise có giá tùy chỉnh.
- **Zaps:** Gói miễn phí bao gồm không giới hạn các Zap hai bước. Professional và cao hơn bao gồm không giới hạn các ứng dụng Premium và không giới hạn các Zap nhiều bước.
- **Thời gian cập nhật:** Gói miễn phí liệt kê thời gian cập nhật 15 phút, Professional liệt kê thời gian cập nhật 2 phút, và Team liệt kê 1 phút.
- **Các ứng dụng Premium:** Professional và cao hơn bao gồm không giới hạn các ứng dụng Premium.
- **Webhooks:** Professional và cao hơn bao gồm webhook.
- **Logic tùy chỉnh:** Professional và cao hơn bao gồm logic tùy chỉnh với các tính năng path, bộ lọc, và formatter.
- **Zapier Tables:** Gói miễn phí bao gồm 2 bảng và 2.500 bản ghi; các gói trả phí tăng giới hạn bảng và bản ghi.
- **Zapier Interfaces:** Gói miễn phí bao gồm 2 interface và các thành phần cơ bản; các gói trả phí tăng giới hạn và mở khóa nhiều tùy chọn hơn.
- **Zapier Chatbots:** Gói miễn phí bao gồm 2 chatbot; các gói trả phí tăng giới hạn chatbot.
- **Các step Zap hỗ trợ AI:** Các gói trả phí tăng giới hạn step hỗ trợ AI đi kèm.
- **Xử lý lỗi:** Professional và cao hơn bao gồm Auto-replay và xử lý lỗi tùy chỉnh.
- **Seats:** Gói Team bao gồm 25 user. Enterprise là tùy chỉnh.
- **Shared workspace:** Gói Team và Enterprise bao gồm các tính năng workspace chia sẻ.
- **Premier support:** Gói Team bao gồm premier support.
- **Technical Account Manager:** Gói Team bao gồm một Trưởng bộ phận quản lý tài khoản kỹ thuật (Technical Account Manager).
- **Single Sign-On:** Enterprise bao gồm SSO SAML.
- **SCIM user provisioning:** Enterprise bao gồm SCIM provisioning.
- **Domain capture:** Enterprise có thể buộc user từ một domain công ty đăng nhập vào tài khoản Enterprise.
- **Quyền admin nâng cao:** Enterprise bao gồm các kiểm soát quản trị và quản trị nâng cao.
- **Lưu giữ dữ liệu tùy chỉnh:** Enterprise bao gồm các kiểm soát lưu giữ dữ liệu tùy chỉnh.
- **Giới hạn sử dụng AI tùy chỉnh:** Enterprise bao gồm giới hạn sử dụng AI tùy chỉnh.
- **Hỗ trợ kỹ thuật được chỉ định:** Enterprise bao gồm hỗ trợ kỹ thuật được chỉ định.

### Các gói trả phí

| Gói | PTOps | Zapier |
|------|-------|--------|
| **Miễn phí** | Tất cả tính năng của ứng dụng, hỗ trợ cộng đồng, mã nguồn mở BSD-3-Clause, tự chạy self-hosted | Gói SaaS miễn phí, lên đến 100 task/tháng, không giới hạn các Zap hai bước |
| **Cấp trung** | Professional Support: $200/tháng, tất cả tính năng của ứng dụng, hệ thống ticket riêng tư, thời gian phản hồi trong 24 giờ | Professional bắt đầu từ $29.99/tháng cho 750 task/tháng; Team bắt đầu từ $103.50/tháng cho 2.000 task/tháng |
| **Enterprise** | Enterprise Support: $1,000/tháng, tất cả tính năng của ứng dụng, thiết lập/hỗ trợ SSO, hỗ trợ cài đặt air-gapped, hệ thống ticket riêng tư, phản hồi trong 1 giờ, live chat | Enterprise SaaS, giá tùy chỉnh, SSO SAML, SCIM, domain capture, kiểm soát admin nâng cao, lưu giữ tùy chỉnh, hỗ trợ được chỉ định |

Zapier công bố giá SaaS tự phục vụ cho các gói Free, Professional, và Team, cộng với giá Enterprise tùy chỉnh. PTOps công bố giá hỗ trợ cố định cho các bản cài đặt self-hosted và không đo lường lượt thực thi workflow hay đặt các tính năng của ứng dụng đằng sau các gói trả phí.

### So sánh hỗ trợ

| Kênh hỗ trợ | PTOps | Zapier |
|--------------|-------|--------|
| **Trợ giúp từ cộng đồng** | GitHub Discussions, GitHub Issues cho bug, Reddit, Discord, video, tài liệu | Trung tâm Trợ giúp, Cộng đồng, tài liệu, tài nguyên học tập |
| **Hỗ trợ trả phí không thuộc enterprise** | Gói Professional bao gồm hệ thống ticket riêng tư và thời gian phản hồi trong 24 giờ | Professional bao gồm hỗ trợ qua email và live chat; Team bao gồm premier support và một Technical Account Manager |
| **Hỗ trợ Enterprise** | Gói Enterprise bao gồm hệ thống ticket riêng tư, thời gian phản hồi trong 1 giờ, live chat, thiết lập/hỗ trợ SSO, và hỗ trợ cài đặt air-gapped | Enterprise bao gồm hỗ trợ kỹ thuật được chỉ định và các tài nguyên onboarding/quản trị Enterprise |
| **Giá self-hosted được công bố** | $200/tháng cho gói Professional, $1,000/tháng cho gói Enterprise | Không có sản phẩm self-hosted |

Hỗ trợ của Zapier được liên kết với cấu trúc gói SaaS của nó. Hỗ trợ của PTOps được liên kết với triển khai self-hosted, và hỗ trợ trả phí không làm thay đổi bộ tính năng của ứng dụng.

### Phạm vi vận hành

| Khả năng | PTOps | Zapier |
|------------|-------|--------|
| **Workflow trực quan** | Có, với các node trigger, event, job, action, limit, controller, và note | Có, với Zaps, Zap nhiều bước, path, bộ lọc, formatter, và các tính năng workflow AI |
| **Tích hợp ứng dụng** | Plugin, webhook, API, job shell, yêu cầu HTTP, và code tùy chỉnh | Hàng nghìn tích hợp ứng dụng, ứng dụng Premium, webhook, bảng, interface, chatbot, và công cụ AI |
| **Mô hình lập trình** | Plugin và job có thể chạy các script hoặc chương trình tùy ý trên các server đích | Các Zap trực quan, step Code, Webhook, action API Request, và Zapier Platform cho các tích hợp ứng dụng |
| **Lập lịch job** | Bộ lập lịch native với các tùy chọn thủ công, schedule, interval, single-shot, plugin, catch-up, blackout, precision, range, và delay | Zap được lập lịch, trigger ứng dụng, webhook, trigger bảng/interface, và các khoảng thời gian polling phụ thuộc vào gói |
| **Kiểm soát luồng** | Các controller workflow, limit, queue, độ đồng thời, thử lại, lựa chọn target, và trọng số job của server | Path, bộ lọc, formatter, trì hoãn, vòng lặp, sub-Zap, auto-replay, và xử lý lỗi tùy chỉnh |
| **Thực thi job fleet-aware** | Các server group native, target expression, thuật toán lựa chọn server, trọng số job, độ đồng thời trên mỗi server, và worker satellite | Không tập trung vào kho kiểm kê server hoặc lựa chọn target fleet-aware |
| **Agent / runner từ xa** | xySat là một runner job từ xa và bộ thu thập metric không có dependency, được cài đặt bằng một lệnh như một dịch vụ trên Linux, Windows, macOS, hoặc Docker | Không có runner self-hosted hay agent cài đặt. Zapier dựa trên đám mây; Enterprise có thể kết nối với các dịch vụ on-premises thông qua VPC peering khi cơ sở hạ tầng của khách hàng ở trên AWS |
| **Monitor server** | Các monitor native, biểu đồ time-series, chế độ xem thời gian thực, plugin monitor tùy chỉnh, metric trên mỗi server và mỗi group | Lịch sử thực thi Zap và giám sát admin, nhưng không phải là một nền tảng monitor server tổng quát |
| **Alerting** | Định nghĩa alert native trên dữ liệu server trực tiếp, với các action fire/clear, snapshot, ticket, kiểm soát giới hạn job và hủy job | Các lỗi và thông báo Zap, nhưng không phải alert cơ sở hạ tầng rộng rãi |
| **Ticket sự cố** | Hệ thống ticket native liên kết với job, alert, file, bình luận, ngày hết hạn, và event có thể chạy được | Không phải là hệ thống ticket sự cố tích hợp sẵn |
| **Snapshot** | Snapshot server/group tại một thời điểm native cho ngữ cảnh pháp lý và action alert | Không thể so sánh vì không có hệ thống snapshot server native |
| **Secret** | Được mã hóa khi lưu trữ, gán cho event, category, plugin, và webhook, phân phối khi runtime dưới dạng biến môi trường hoặc template | Quản lý kết nối ứng dụng và credential bên trong Zapier |
| **SSO** | Được bao gồm trong ứng dụng mã nguồn mở, với các pattern SSO trusted-header và hướng dẫn thiết lập | Tính năng Enterprise |
| **Role và permission** | Được bao gồm trong ứng dụng mã nguồn mở, với privilege, role, giới hạn category, và giới hạn group | Các tính năng Team workspace trên gói Team; Enterprise bổ sung quyền admin nâng cao và provisioning user |
| **Cài đặt air-gapped** | Được hỗ trợ bởi tài liệu, và hỗ trợ Enterprise bao gồm hỗ trợ cài đặt air-gapped | Không có triển khai Zapier self-hosted hay air-gapped |

### Trường hợp sử dụng hợp lý

Chọn **Zapier** khi vấn đề chính là tự động hóa được host trên các ứng dụng SaaS, công cụ AI, form, bảng, chatbot, và các workflow kinh doanh, đặc biệt khi đội ngũ đánh giá cao một hệ sinh thái ứng dụng khổng lồ, thiết lập nhanh chóng, các template, và một nền tảng tự động hóa no-code/low-code được biết đến rộng rãi.

Chọn **PTOps** khi vấn đề chính là vận hành cả cơ sở hạ tầng và các workflow production cùng nhau: lập lịch job trên các server, chọn các target khỏe mạnh, xem metric server trực tiếp, kích hoạt alert, đính kèm snapshot, mở ticket, và chạy các job khắc phục sự cố từ cùng một hệ thống.

### Điểm mấu chốt chính

- Zapier là một nền tảng tự động hóa được host mạnh mẽ với hệ sinh thái ứng dụng rất lớn, sự nhận diện thương hiệu rộng rãi, và một trình dựng workflow no-code/low-code thân thiện.
- Zapier không tự chạy self-hosted, và giá của nó dựa trên lượng task của SaaS.
- PTOps bao gồm tất cả tính năng của ứng dụng trong phiên bản mã nguồn mở, bao gồm SSO, role, workflow, monitor, alert, ticket, plugin, webhook, bucket, secret, snapshot, và lập lịch fleet-aware.
- Zapier là một sự lựa chọn phù hợp hơn cho tự động hóa ứng dụng kinh doanh, tích hợp SaaS, các trợ lý workflow AI, form, bảng, và các đội ngũ no-code/low-code được host sẵn.
- PTOps có lợi thế khi nền tảng tự động hóa phải tự chạy self-hosted và cũng phải là nền tảng monitor, alert, ticket sự cố, snapshot và khắc phục sự cố.
- Zapier Professional bắt đầu từ $29.99/tháng cho 750 task/tháng, Team từ $103.50/tháng cho 2.000 task/tháng, và Enterprise là giá tùy chỉnh. PTOps công bố giá hỗ trợ ở mức $200/tháng cho gói Professional và $1,000/tháng cho gói Enterprise, và không đo lường các lượt thực thi workflow.

### Nguồn tham khảo

- [Zapier Pricing](https://zapier.com/pricing)
- [Zapier Enterprise Plan](https://help.zapier.com/hc/en-us/articles/8496213575053-Get-started-with-Zapier-s-Enterprise-plan)
- [Manage Zapier Team or Enterprise Account](https://help.zapier.com/hc/en-us/articles/8496307504909)
- [Zapier Domain Capture](https://help.zapier.com/hc/en-us/articles/19703377133325)
- [Zapier On-Premises Connectivity](https://zapier.com/blog/can-zapier-connect-to-on-premises/)
- [Zapier Apps](https://zapier.com/apps)
- [Zapier Help Center](https://help.zapier.com/hc/en-us)
