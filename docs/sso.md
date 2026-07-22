# Đăng nhập một lần (Single Sign-On)

## Tổng quan

Đăng nhập một lần (SSO) là một cơ chế chuyển giao việc xác thực người dùng PTOps cho một bên cung cấp định danh thứ ba, chẳng hạn như Microsoft, Google, GitHub, Okta, Auth0, Cognito, v.v. Tài liệu này phác thảo việc triển khai SSO trong PTOps, bao gồm cấu hình, cách sử dụng và các thực hành tốt nhất.

Việc cấu hình SSO là một quy trình phức tạp và mang tính kỹ thuật cao, đòi hỏi sự phối hợp chặt chẽ giữa các nhà cung cấp định danh, chứng chỉ, middleware và các cài đặt ứng dụng. Rất dễ xảy ra sai sót và để lộ các lỗ hổng bảo mật trong hệ thống của bạn. Mặc dù chúng tôi cung cấp tất cả các tài liệu cần thiết ở đây, chúng tôi khuyên bạn nên sử dụng [Gói Enterprise](https://xyops.io/pricing) của chúng tôi. Gói này cung cấp cho bạn quyền truy cập vào dịch vụ onboarding cao cấp, nơi đội ngũ của chúng tôi sẽ hướng dẫn bạn qua từng bước, xác thực cấu hình của bạn và đảm bảo việc tích hợp vừa an toàn vừa đáng tin cậy. Gói này cũng giúp bạn được hỗ trợ ticket ưu tiên và hỗ trợ qua live chat trực tiếp với kỹ sư PTOps.

PTOps sử dụng phương thức triển khai "trusted headers" (header đáng tin cậy) cho SSO, cho phép dễ dàng tích hợp với một số công cụ xác thực và middleware. Chúng bao gồm [Plugin OIDC PTOps](#plugin-oidc-ptops) của chúng tôi, [OAuth2-Proxy](https://github.com/oauth2-proxy/oauth2-proxy), [Vouch](https://github.com/vouch/vouch-proxy), [Authelia](https://github.com/authelia/authelia) và [Authentik](https://github.com/goauthentik/authentik), cùng nhiều công cụ khác. Nó cũng hỗ trợ [Tailscale](tailscale.md) (tức là [Tailscale Serve](https://tailscale.com/kb/1312/serve)) vốn chuyển tiếp các header theo cách tương tự.

Quy trình trusted header hoạt động như sau:

1. Công cụ xác thực thực hiện xác thực người dùng, bằng cách đứng trước PTOps hoặc chạy như một lệnh SSO của PTOps.
2. Sau khi người dùng được xác thực, công cụ sẽ chuyển tiếp yêu cầu đến PTOps và bao gồm một tập hợp các "trusted header" đặc biệt.
3. PTOps phát hiện các header này, tạo hoặc cập nhật tài khoản người dùng nếu cần, và đăng nhập cho người dùng bằng hệ thống session của riêng nó.
	- PTOps cũng có thể tự động gán các role và/hoặc privilege cho người dùng dựa trên các nhóm mà bạn định nghĩa trong nhà cung cấp định danh của mình.

Dưới đây là các hướng đi chính mà chúng tôi khuyên dùng:

- [Plugin OIDC PTOps](#plugin-oidc-ptops) thường là hướng đi OIDC đơn giản nhất. Nó có ít thành phần chuyển động hơn, và đặc biệt tốt cho các bản cài đặt không dùng Docker.
- [OAuth2-Proxy](#oauth2-proxy) là một giải pháp phổ biến và được thử nghiệm rộng rãi. Nó có nhiều thành phần triển khai hơn, nhưng có khả năng tương thích cao hơn với nhiều nhà cung cấp OIDC và xử lý được nhiều trường hợp đặc thù của nhà cung cấp hơn.
- [Authentik](#authentik), [Authelia](#active-directory), [Tailscale](#tailscale) và các hệ thống trusted-header khác cũng có thể hoạt động tốt, tùy thuộc vào môi trường của bạn.

## Cấu hình

Tất cả các cài đặt SSO cho PTOps được chứa trong file `sso.json`, thường được cài đặt tại `/opt/xyops/conf/sso.json`, nhưng có thể được ánh xạ tới một vị trí máy chủ khác nếu sử dụng Docker. Cấu hình mặc định trông như thế này:

```json
{
	"enabled": false,
	"whitelist": ["127.0.0.1", "10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16", "::1/128", "fd00::/8", "169.254.0.0/16", "fe80::/10"],
	"header_map": {
		"username": "x-forwarded-email",
		"full_name": "x-forwarded-email",
		"email": "x-forwarded-email",
		"groups": "x-forwarded-groups"
	},
	"cleanup_username": true,
	"cleanup_full_name": true,
	"group_role_map": {},
	"group_privilege_map": {},
	"replace_roles": false,
	"replace_privileges": false,
	"admin_bootstrap": "",
	"logout_url": "",
	"command": "",
	"preset": "",
	"oidc": {}
}
```

Dưới đây là mô tả của tất cả các thuộc tính SSO:

| Tên Thuộc tính | Loại | Mô tả |
|---------------|------|-------------|
| `enabled` | Boolean | Đặt thuộc tính này thành `true` để bật đăng nhập SSO (và tắt đăng nhập user/pass cổ điển!). |
| `whitelist` | Mảng hoặc Boolean | Cho phép bạn giới hạn các trusted header cho một proxy hoặc dải mạng cụ thể. Đặt thành `false` khi không có proxy tin cậy riêng biệt, chẳng hạn như với OIDC Plugin. Xem [Môi trường Production](#moi-truong-production) để biết thêm chi tiết. |
| `header_map` | Object | Cho phép bạn ánh xạ các trusted header với các thuộc tính người dùng PTOps tiêu chuẩn. Xem [Ánh xạ Header](#anh-xa-header-header-map) bên dưới để biết chi tiết. |
| `cleanup_username` | Boolean | Đặt thuộc tính này thành `true` để làm sạch username nhận được từ các trusted header. Xem [Ánh xạ Header](#anh-xa-header-header-map) bên dưới để biết chi tiết. |
| `cleanup_full_name` | Boolean | Đặt thuộc tính này thành `true` để làm sạch tên đầy đủ của người dùng nhận được từ các trusted header. Xem [Ánh xạ Header](#anh-xa-header-header-map) bên dưới để biết chi tiết. |
| `group_role_map` | Object | Tự động gán các role cho người dùng dựa trên các nhóm nhận được từ các trusted header. Xem [Nhóm người dùng](#nhom-nguoi-dung-user-groups) bên dưới để biết chi tiết. |
| `group_role_separator` | String | Ký tự tùy chỉnh tùy chọn để phân tách các role nhóm bên ngoài (mặc định là dấu phẩy). Xem [Nhóm người dùng](#nhom-nguoi-dung-user-groups) bên dưới để biết chi tiết. |
| `group_privilege_map` | Object | Tự động gán các privilege cho người dùng dựa trên các nhóm nhận được từ các trusted header. Xem [Nhóm người dùng](#nhom-nguoi-dung-user-groups) bên dưới để biết chi tiết. |
| `replace_roles` | Boolean | Đặt thuộc tính này thành `true` để thay thế **tất cả** các role của người dùng bằng các role được ánh xạ qua `group_role_map`. Xem [Nhóm người dùng](#nhom-nguoi-dung-user-groups) bên dưới để biết chi tiết. |
| `replace_privileges` | Boolean | Đặt thuộc tính này thành `true` để thay thế **tất cả** các privilege của người dùng bằng các privilege được ánh xạ qua `group_role_map`. Xem [Nhóm người dùng](#nhom-nguoi-dung-user-groups) bên dưới để biết chi tiết. |
| `admin_bootstrap` | String | Tạm thời gán toàn quyền quản trị (administrator) cho một người dùng nhất định. Thuộc tính này được sử dụng để khởi động hệ thống trong quá trình thiết lập ban đầu. Xem [Bootstrap Admin](#bootstrap-admin) để biết thêm chi tiết. |
| `logout_url` | String | Đặt thuộc tính này thành URL để chuyển hướng người dùng đến sau khi PTOps thực hiện đăng xuất của riêng nó. Xem [Đăng xuất](#dang-xuat) bên dưới để biết chi tiết. |
| `command` | String | Lệnh shell tùy chỉnh tùy chọn để lọc tất cả các yêu cầu SSO gửi đến và chèn các header. Xem [Lệnh tùy chỉnh](#lenh-tuy-chinh-custom-command) bên dưới để biết chi tiết. |
| `preset` | String | Preset ID tùy chọn giúp cấu hình sẵn SSO cho các nhà cung cấp cụ thể. Hiện tại được sử dụng cho [Tailscale](tailscale.md). |

Các lệnh SSO tùy chỉnh cũng có thể định nghĩa các khối cấu hình bổ sung của riêng chúng bên trong `sso.json`. Ví dụ, [Plugin OIDC PTOps](#plugin-oidc-ptops) sử dụng một object `oidc`. PTOps truyền toàn bộ cấu hình SSO cho lệnh, nhưng bản thân nó chỉ sử dụng các thuộc tính tiêu chuẩn.

### Ánh xạ Header (Header Map)

Object `header_map` cho phép bạn định nghĩa các header gửi đến nào sẽ ánh xạ tới thuộc tính người dùng nào của PTOps (username, email, v.v.). Lý do chúng ta cần một bản đồ ánh xạ là vì tất cả các công cụ middleware xác thực và nhà cung cấp định danh thực hiện việc này hơi khác nhau một chút. Các công cụ auth khác nhau sử dụng các tên header khác nhau, và một số nhà cung cấp định danh *chỉ* cung cấp địa chỉ email, trong khi một số khác cũng cung cấp username, và một số khác nữa cung cấp cả nhóm (groups). Ánh xạ header cho phép sự linh hoạt hoàn toàn trong cấu hình của chúng tôi, nhờ đó chúng tôi có thể hỗ trợ bất kỳ sự kết hợp công cụ và IdP nào.

Ví dụ, nhiều công cụ SSO có thể gửi một header user, một header name, một header email và một header groups. Nếu bạn nhận được cả bốn, hãy sử dụng thiết lập ánh xạ header như thế này:

```json
"header_map": {
	"username": "x-forwarded-user",
	"full_name": "x-forwarded-name",
	"email": "x-forwarded-email",
	"groups": "x-forwarded-groups"
}
```

Nếu công cụ SSO của bạn chỉ gửi username và email, hãy sử dụng username cho cả tên hiển thị:

```json
"header_map": {
	"username": "x-forwarded-user",
	"full_name": "x-forwarded-user",
	"email": "x-forwarded-email",
	"groups": "x-forwarded-groups"
}
```

Và nếu nhà cung cấp định danh của bạn chỉ gửi địa chỉ email, hãy sử dụng thiết lập tương tự như thế này:

```json
"header_map": {
	"username": "x-forwarded-email",
	"full_name": "x-forwarded-email",
	"email": "x-forwarded-email"
}
```

Trong trường hợp này, chúng tôi đang sử dụng địa chỉ email làm username, tên đầy đủ và email. Tại đây, PTOps có thể giúp "làm sạch" các trường username và tên đầy đủ khi nó trích xuất chúng từ địa chỉ email của người dùng. Xem phần sau để biết chi tiết về việc này.

#### Làm sạch Header (Header Cleanup)

Để thực hiện làm sạch header, đặt thuộc tính `cleanup_username` và/hoặc `cleanup_full_name` thành `true`. Dưới đây là chức năng của từng thuộc tính:

- `cleanup_username` trích xuất một username có thể sử dụng được từ một địa chỉ email. Nó thực hiện điều này bằng cách lấy tất cả ký tự đứng trước ký hiệu `@`, loại bỏ tất cả các ký tự không hợp lệ (bất kỳ ký tự nào khác ngoài chữ-số, dấu chấm, dấu gạch ngang, dấu chấm câu và dấu gạch dưới) và chuyển nó thành chữ thường. Ví dụ: `John.Smith@example.com` sẽ trở thành `john.smith`.
	- Điều này giả định rằng tất cả người dùng của bạn đều có "địa chỉ email công ty" và đều chia sẻ cùng một domain email, do đó phần đầu tiên trong địa chỉ email của họ là một username khả thi.
	- Nếu bạn muốn sử dụng toàn bộ địa chỉ email làm username, hãy đặt `cleanup_username` thành `false`. Điều này sẽ sử dụng địa chỉ email đầy đủ nhưng vẫn chuyển đổi tất cả các ký tự không hợp lệ thành dấu gạch dưới và viết thường kết quả cuối cùng. Trong trường hợp này, `John.Smith@example.com` sẽ trở thành `john.smith_example.com`.
- `cleanup_full_name` trích xuất một tên hiển thị có thể sử dụng được từ một địa chỉ email. Nó thực hiện điều này bằng cách lấy tất cả ký tự đứng trước ký hiệu `@`, chuyển đổi các dấu chấm thành khoảng trắng và viết hoa chữ cái đầu tiên của mỗi từ. Ví dụ: `john.smith@example.com` sẽ trở thành `John Smith`. Rõ ràng điều này hoạt động tốt nhất cho các định dạng địa chỉ email kiểu `ten.ho`.
	- Nếu bạn đặt `cleanup_full_name` thành false, địa chỉ email đầy đủ của người dùng sẽ được sử dụng làm tên hiển thị của họ.

Những sự phức tạp này là lý do tại sao việc kiểm thử công cụ SSO của bạn trước khi tích hợp vào PTOps là rất hữu ích, đặc biệt là khi sử dụng thiết lập dựa trên proxy. Một echo server truyền qua có thể cho bạn thấy chính xác những header nào mà IdP và middleware xác thực của bạn gửi đi, giúp việc cấu hình `header_map` của PTOps trở nên dễ dàng hơn nhiều.

### Quyền mặc định của User

Khi người dùng được tạo lần đầu qua SSO, một tập hợp các privilege mặc định sẽ được áp dụng, trừ khi `replace_privileges` được thiết lập. Điều này được cấu hình trong file `config.json` chính ở thuộc tính [default_user_privileges](config.md#default_user_privileges). Tập hợp mặc định là:

```json
"default_user_privileges": {
	"create_events": true,
	"edit_events": true,
	"run_jobs": true,
	"tag_jobs": true,
	"create_tickets": true,
	"edit_tickets": true
}
```

Đây cùng là tập hợp các privilege mặc định được áp dụng cho người dùng mới được tạo thủ công trong PTOps Admin UI. Các quyền này (cùng với các role người dùng tùy chỉnh) có thể được tùy chỉnh thêm bằng cách ánh xạ các nhóm IdP của bạn. Xem phần tiếp theo để biết chi tiết.

### Nhóm người dùng (User Groups)

Với `group_role_map` và `group_privilege_map`, bạn có thể ánh xạ các nhóm người dùng của riêng mình (như được định nghĩa trong nhà cung cấp định danh OIDC/SAML của bạn) tới các [role và privilege](privileges.md) của người dùng ở phía PTOps. Dưới đây là cách hoạt động. Hãy tưởng tượng một tập hợp các trusted header gửi đến như thế này (ở đây sử dụng GitHub IdP làm ví dụ):

```json
{
    "x-forwarded-email": "jhuckaby@example.com",
    "x-forwarded-groups": "pixlcore,pixlcore:owners",
    "x-forwarded-user": "jhuckaby"
}
```

Trong trường hợp này, người dùng `jhuckaby` là thành viên của hai nhóm: `pixlcore` và `pixlcore:owners`, sử dụng các nhóm được phân tách bằng dấu phẩy. Giả sử bạn đã ánh xạ header `x-forwarded-groups` tới `groups` qua [Ánh xạ Header](#anh-xa-header-header-map), dưới đây là cách bạn có thể chỉ định `pixlcore:owners` để người dùng thuộc nhóm này tự động trở thành quản trị viên đầy đủ (administrator):

```json
"group_privilege_map": {
	"pixlcore:owners": ["admin"]
}
```

Và nếu bạn có các role được định nghĩa trong PTOps, bạn cũng có thể ánh xạ các nhóm người dùng tới các role đó bằng cách sử dụng các ID Role. Ví dụ, giả sử bạn có hai role với ID là `r12345` và `r67890`:

```json
"group_role_map": {
	"pixlcore": ["r12345", "r67890"]
}
```

Điều này sẽ áp dụng cả hai role cho tất cả người dùng trong nhóm IdP `pixlcore`.

Nếu IdP của bạn chỉ định các role nhóm được phân tách bằng một ký tự khác ngoài dấu phẩy (ví dụ: ký tự pipe `|`), hãy sử dụng thuộc tính [SSO.group_role_separator](config.md#sso-group_role_separator) để tùy chỉnh nó.

Theo mặc định, các role và privilege này được áp dụng theo cách "tích lũy" (additive) vào hồ sơ người dùng. Nghĩa là chúng sẽ không bao giờ *xóa bỏ* một role hoặc privilege. Điều này giúp bạn có thể áp dụng thủ công các role và quyền người dùng của riêng mình bằng cách sử dụng PTOps Admin UI, và mọi thứ đều hoạt động hài hòa. Tuy nhiên, nếu bạn không muốn hành vi này và thay vào đó muốn IdP của bạn là nguồn dữ liệu gốc duy nhất (single source of truth) cho tất cả các role và privilege của người dùng, hãy đặt `replace_roles` và/hoặc `replace_privileges` thành true. Những tùy chọn đó sẽ thay thế **tất cả** các role và/hoặc privilege bằng bất kỳ thứ gì chúng tôi nhận được từ bản đồ nhóm IdP (điều này bao gồm cả tập hợp mặc định cho người dùng mới). Sự đồng bộ này diễn ra sau mỗi lần người dùng đăng nhập, ghi đè lên bất kỳ thay đổi cục bộ nào được thực hiện trong PTOps.

Lưu ý rằng không phải tất cả các nhà cung cấp định danh đều gửi kèm các nhóm theo mặc định. Trong nhiều trường hợp, bạn sẽ phải bật tính năng này một cách thủ công trong portal admin của IdP của mình.

Xem [Privilege](privileges.md) để biết thêm về các role và privilege người dùng trong PTOps.

### Bootstrap Admin

Đối với giai đoạn thiết lập và cấu hình ban đầu, việc nâng cấp bản thân lên làm quản trị viên đầy đủ thường rất hữu ích. Điều này sẽ tiện lợi nếu IdP của bạn không gửi kèm các nhóm, hoặc bạn chưa cấu hình tính năng đó. Để bắt buộc một người dùng duy nhất làm admin, hãy thêm thuộc tính `admin_bootstrap` và đặt nó thành *chính xác username của bạn*:

```json
"admin_bootstrap": "jhuckaby"
```

Lưu ý rằng username ở đây phải khớp chính xác, bao gồm cả bất kỳ quá trình làm sạch nào có thể diễn ra (xem `cleanup_username` ở trên). Ngoài ra, hãy lưu ý rằng PTOps ghi lại một cảnh báo trong nhật ký hoạt động (activity log) mỗi khi thuộc tính này được áp dụng cho một người dùng. Điều này đóng vai trò như một lời nhắc nhở để gỡ bỏ `admin_bootstrap` sau khi mọi thứ đã được cấu hình và hoạt động bình thường với các nhóm IdP của bạn (hoặc các role / privilege được chỉ định thủ công).

### Đăng xuất

Khi một người dùng nhấp vào nút "Logout" ở góc trên bên phải của UI PTOps, PTOps sẽ xóa cookie session cục bộ của riêng nó. Trong nhiều thiết lập SSO, cũng có thể có một session proxy xác thực bên ngoài và một session nhà cung cấp định danh. Nếu bạn muốn xóa hoặc tiếp tục đi qua các hệ thống đó, hãy cấu hình một thuộc tính `logout_url` trong `sso.json`.

Đối với [Plugin OIDC PTOps](#plugin-oidc-ptops), plugin này không quản lý việc đăng xuất IdP trực tiếp. Hãy đặt `logout_url` thành URL đăng xuất của nhà cung cấp của bạn, nếu bạn có:

```json
"logout_url": "https://your-idp.example.com/logout"
```

Đối với Authentik, `logout_url` thường trỏ đến endpoint đăng xuất proxy của Authentik. Xem [Cấu hình Authentik SSO](#cau-hinh-authentik-sso) trong phần Authentik bên dưới.

Đối với OAuth2-Proxy, việc đăng xuất thường cần xóa các cookie này theo thứ tự:

- Cookie session của PTOps.
- Cookie của OAuth2-Proxy.
- Cookie của IdP bên ngoài.

PTOps xử lý cookie đầu tiên bằng API của chính nó. Để tiếp tục đi qua quá trình đăng xuất của OAuth2-Proxy, hãy đặt `logout_url` như thế này:

```json
"logout_url": "/oauth2/sign_out?rd=_ENCODED_IDP_LOGOUT_URL_"
```

Đường dẫn `/oauth2/sign_out` được chặn lại bởi OAuth2-Proxy để xử lý việc xóa cookie thứ hai, và sau đó cuối cùng nó sẽ chuyển hướng đến endpoint đăng xuất IdP của bạn để hoàn tất quy trình. Giá trị `_ENCODED_IDP_LOGOUT_URL` cần được thiết lập bởi bạn, vì nó được tùy chỉnh theo từng IdP và thường cụ thể cho tổ chức của bạn (ví dụ: trang đăng xuất mang thương hiệu của riêng bạn). Ngoài ra, hãy lưu ý rằng nó cần được mã hóa URL (URL-encode) một cách chính xác. Hãy tham khảo tài liệu của nhà cung cấp định danh của bạn để xem cách định dạng URL này.

Dưới đây là ví dụ về URL đăng xuất để sử dụng cho GitHub:

```json
"logout_url": "/oauth2/sign_out?rd=https%3A%2F%2Fgithub.com%2Flogout"
```

**Nâng cao:** Nếu IdP của bạn truyền một ID Token qua header `Authorization: Bearer ...`, và URL đăng xuất của họ chấp nhận một tham số truy vấn [id_token_hint](https://openid.net/specs/openid-connect-rpinitiated-1_0.html#RPLogout), bạn có thể đưa nó vào URL chuyển hướng đã mã hóa của mình bằng cách sử dụng macro placeholder đặc biệt này: `[id_token_hint]`. Bản thân token được mở rộng cũng sẽ được mã hóa URL. Ví dụ:

```json
"logout_url": "/oauth2/sign_out?rd=https%3A%2F%2F_YOUR_IDP_DOMAIN_%2Flogout%3Fid_token_hint%3D[id_token_hint]"
```

Một lưu ý quan trọng cuối cùng ở đây. Khi sử dụng OAuth2-Proxy, bạn sẽ cần đưa domain IdP mà bạn sẽ chuyển hướng đến khi đăng xuất vào "whitelist". Hãy sử dụng thuộc tính cấu hình [whitelist_domains](https://oauth2-proxy.github.io/oauth2-proxy/configuration/overview/) cho việc này (hoặc biến môi trường `OAUTH2_PROXY_WHITELIST_DOMAINS`). Thêm domain IdP *bên cạnh* domain PTOps của riêng bạn, phân tách bằng dấu phẩy:

```
OAUTH2_PROXY_WHITELIST_DOMAINS: ".yourcompany.com,.github.com"
```

## Google SSO Tích hợp (Native Google SSO)

PTOps có thể thực hiện quy trình đăng nhập Google OpenID Connect tích hợp sẵn mà không cần một proxy xác thực riêng biệt. Chế độ này dành cho các domain Google Workspace hoặc các domain Gmail do công ty kiểm soát. Người dùng nhấp vào **Sign in with Google** trên trang đăng nhập PTOps, Google xác thực họ và PTOps tạo cookie session cục bộ bình thường sau khi xác thực token ID Google.

Quy trình này giữ cho việc đăng nhập bằng username/password cục bộ khả dụng theo mặc định, nhờ đó bạn có thể giữ một tài khoản admin khẩn cấp bên ngoài Google SSO.

### Thiết lập Google Cloud Console

Trong Google Cloud Console:

1. Tạo hoặc chọn một dự án Google Cloud.
2. Cấu hình màn hình đồng ý OAuth (OAuth consent screen) cho tổ chức của bạn.
3. Tạo một **OAuth Client ID** với loại ứng dụng là **Web application**.
4. Thêm URI redirect được ủy quyền này, thay thế hostname bằng URL PTOps của bạn:

```text
https://xyops.yourcompany.com/api/app/google_sso_callback
```

5. Sử dụng các scope sau:

```text
openid email profile
```

6. Sao chép **Client ID** và **Client Secret** được tạo ra.

### Cấu hình PTOps

Cấu hình object `SSO` cấp cao nhất trong cấu hình PTOps hoặc các cấu hình ghi đè (overrides):

```json
{
	"SSO": {
		"enabled": true,
		"provider": "google",
		"client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
		"client_secret": "env:XYOPS_GOOGLE_CLIENT_SECRET",
		"redirect_uri": "https://xyops.yourcompany.com/api/app/google_sso_callback",
		"allowed_domains": ["yourcompany.com"],
		"auto_provision": true,
		"default_role": "viewer",
		"button_label": "Sign in with Google",
		"allow_local_login": true,
		"state_ttl": 600
	}
}
```

Đặt client secret trong môi trường dịch vụ PTOps:

```bash
export XYOPS_GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
```

Ghi chú cấu hình:

- `provider` phải được đặt thành `google` đối với Google SSO tích hợp.
- `client_secret` có thể sử dụng `env:VARIABLE_NAME`, nhờ đó các secret không cần phải lưu trữ trong các file cấu hình.
- `redirect_uri` phải khớp chính xác với URI redirect được ủy quyền trong Google Cloud Console.
- `allowed_domains` là bắt buộc. Google có thể nhận được một gợi ý `hd` để thuận tiện, nhưng PTOps vẫn xác thực email claim đã xác minh sau khi xác thực token.
- `auto_provision` kiểm soát những người dùng chưa biết. Nếu là `false`, email Google phải khớp sẵn với một người dùng PTOps hiện có.
- `default_role` là tùy chọn. PTOps sẽ không chỉ định một role cấp quyền quản trị viên trong quá trình tự động cấp phát tài khoản (auto-provisioning) của Google.
- `allow_local_login` mặc định là `true`. Hãy bật tính năng này cho đến khi bạn đã xác minh SSO và có một admin dự phòng khẩn cấp.
- `state_ttl` mặc định là 600 giây và phải nằm trong khoảng từ 60 đến 3600 giây.

### Phát triển cục bộ (Local Development)

Để thử nghiệm cục bộ, hãy thêm một URI redirect localhost vào Google OAuth client và khớp nó trong cấu hình PTOps:

```text
http://localhost:5522/api/app/google_sso_callback
```

Ví dụ cấu hình ghi đè cục bộ:

```json
{
	"base_app_url": "http://localhost:5522",
	"SSO": {
		"enabled": true,
		"provider": "google",
		"client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
		"client_secret": "env:XYOPS_GOOGLE_CLIENT_SECRET",
		"redirect_uri": "http://localhost:5522/api/app/google_sso_callback",
		"allowed_domains": ["yourcompany.com"],
		"auto_provision": true,
		"allow_local_login": true
	}
}
```

Khởi động lại PTOps sau khi thay đổi cấu hình hoặc các biến môi trường.

### Hành vi Bảo mật

Google SSO tích hợp xác thực tài liệu khám phá (discovery document) của Google, trao đổi mã ủy quyền (authorization code) phía server, xác thực ID token bằng JWKS của Google và kiểm tra issuer, audience, expiry, nonce, email đã xác minh, subject và domain email được phép. PTOps chỉ lưu trữ Google subject được sử dụng để liên kết tài khoản. Nó không lưu trữ access token, ID token hoặc refresh token.

Việc so khớp người dùng diễn ra theo thứ tự sau:

1. Người dùng hiện có với `sso.google.sub` khớp.
2. Người dùng hiện có với địa chỉ email khớp, sau đó liên kết Google subject.
3. Tự động cấp phát (auto-provision) một người dùng không phải admin mới nếu `auto_provision` được bật.

Nếu xảy ra xung đột username trong quá trình tự động cấp phát và các email khác nhau, PTOps sẽ tạo một username có hậu tố mang tính xác định thay vì gộp các tài khoản.

### Kiểm thử

Sau khi bật Google SSO:

1. Xác nhận trang đăng nhập hiển thị nút **Sign in with Google**.
2. Xác nhận việc đăng nhập cục bộ vẫn hoạt động khi `allow_local_login` là `true`.
3. Đăng nhập bằng một tài khoản từ một domain được phép và xác nhận bạn truy cập được vào dashboard PTOps.
4. Thử một tài khoản từ một domain khác và xác nhận nó bị từ chối.
5. Kiểm tra bộ nhớ trình duyệt và log PTOps để xác nhận các token Google và client secret không bị lộ.

Để gỡ lỗi hành vi SSO của PTOps, hãy tăng [debug_level](config.md#debug_level) và theo dõi:

```text
/opt/xyops/logs/SSO.log
```

Không để mức log debug cao lâu hơn mức cần thiết.

## Plugin OIDC PTOps

> [!IMPORTANT]
> Tính năng này yêu cầu PTOps v1.0.57 hoặc mới hơn.

Plugin [xyplug-sso-oidc](https://github.com/pixlcore/xyplug-sso-oidc) là một lệnh SSO của PTOps thực hiện trực tiếp quy trình đăng nhập [OpenID Connect](https://openid.net/developers/how-connect-works/). Nó chuyển hướng trình duyệt đến nhà cung cấp định danh của bạn, xử lý callback, xác thực các token OIDC, tìm nạp dữ liệu profile người dùng và phát ra các trusted header trả về cho PTOps.

Điều này giúp việc triển khai trở nên đơn giản: PTOps giao tiếp với plugin, và plugin giao tiếp với IdP của bạn. Bạn không cần phải chạy một OAuth2-Proxy, Authentik, AWS ALB hoặc reverse proxy riêng biệt chỉ để hoàn tất quy trình trình duyệt OIDC.

Sự đánh đổi ở đây là phạm vi phủ sóng của nhà cung cấp. Plugin được thiết kế nhẹ và trực tiếp một cách có chủ ý, vì vậy nó có thể không xử lý được mọi hành vi khác biệt của nhà cung cấp hoặc các trường hợp đặc thù của doanh nghiệp lớn. Nếu IdP của bạn có hành vi OIDC bất thường, hoặc nếu bạn muốn có một proxy trước cổng với lịch sử lâu đời trên nhiều nhà cung cấp, [OAuth2-Proxy](#oauth2-proxy) vẫn là một lựa chọn tuyệt vời.

### Cách thức hoạt động

Plugin chạy trong quy trình đăng nhập SSO của PTOps:

1. PTOps nhận được một yêu cầu trình duyệt gửi tới URL root của ứng dụng.
2. PTOps khởi chạy lệnh SSO đã cấu hình và gửi siêu dữ liệu yêu cầu (request metadata) cho nó qua STDIN.
3. Plugin chuyển hướng trình duyệt đến nhà cung cấp OIDC của bạn.
4. Nhà cung cấp gửi trình duyệt quay lại [base_app_url](config.md#base_app_url) của PTOps cùng với một mã ủy quyền (authorization code).
5. PTOps khởi chạy lại plugin cho yêu cầu callback.
6. Plugin xác thực trạng thái (state), trao đổi mã, xác thực ID token, tìm nạp UserInfo khi được cấu hình và phát ra các trusted header.
7. PTOps tiếp nhận các trusted header đó thông qua hệ thống đăng nhập SSO bình thường.

### Yêu cầu

- Node.js 20 trở lên trên conductor PTOps.
- Một ứng dụng/client OIDC được cấu hình tại nhà cung cấp định danh của bạn.
- URI redirect/callback OIDC được đặt khớp chính xác với [base_app_url](config.md#base_app_url) của PTOps.

Ví dụ về redirect URI:

```text
https://xyops.yourcompany.com
```

Không thêm `/callback`, `/oauth2/callback` hay bất kỳ đường dẫn nào khác vào URL redirect. PTOps kích hoạt plugin này từ URI gốc, do đó URL callback của IdP phải khớp chính xác với Base App URL của PTOps.

### Cài đặt

Bạn có thể chạy plugin qua `npx`:

```json
"command": "npx -y @pixlcore/xyplug-sso-oidc@1.0.0"
```

Đối với môi trường production, chúng tôi khuyên bạn nên cài đặt trước module NPM trên toàn cầu (globally) và trỏ PTOps vào file thực thi đã cài đặt:

```bash
npm i -g @pixlcore/xyplug-sso-oidc@1.0.0
```

Sau đó cấu hình thuộc tính `command` như thế này:

```json
"command": "/usr/local/bin/xyplug-sso-oidc"
```

Lưu ý rằng CLI NPM của bạn có thể đặt các file thực thi toàn cục ở một nơi khác ngoài `/usr/local/bin`. Để tìm thư mục chính xác trên hệ thống của bạn, hãy chạy:

```bash
npm bin -g
```

Sau đó sử dụng đường dẫn đầy đủ đến `xyplug-sso-oidc` từ thư mục đó trong cài đặt `command` của bạn.

Việc này tránh việc gọi `npx` trên mỗi lượt truy cập của người dùng, vốn có thể thêm một yêu cầu tới NPM registry và làm chậm quá trình đăng nhập.

### Cấu hình cơ bản

Dưới đây là một ví dụ `sso.json` hoàn chỉnh sử dụng OIDC Plugin:

```json
{
	"enabled": true,
	"whitelist": false,
	"header_map": {
		"username": "x-forwarded-user",
		"full_name": "x-forwarded-name",
		"email": "x-forwarded-email",
		"groups": "x-forwarded-groups"
	},
	"cleanup_username": false,
	"cleanup_full_name": false,
	"group_role_map": {},
	"group_privilege_map": {},
	"logout_url": "https://YOUR_IDP_LOGOUT_URL",
	"command": "/usr/local/bin/xyplug-sso-oidc",
	"oidc": {
		"issuer": "https://YOUR_OIDC_ISSUER",
		"client_id": "YOUR_CLIENT_ID",
		"client_secret": "YOUR_CLIENT_SECRET",
		"state_secret": "GENERATE_A_LONG_RANDOM_SECRET",
		"scope": "openid profile email",
		"token_endpoint_auth_method": "client_secret_basic",
		"use_pkce": true,
		"claim_map": {
			"username": ["preferred_username", "email", "sub"],
			"full_name": ["name", "email"],
			"email": "email",
			"groups": ["groups", "roles"]
		}
	}
}
```

Một vài lưu ý quan trọng:

- `whitelist` thường được đặt thành `false` cho plugin này, vì không có IP proxy tin cậy riêng biệt. Bản thân plugin thực hiện cầu nối xác thực.
- `header_map` nên khớp với các header do plugin phát ra.
- `state_secret`, `client_secret` và các log debug SSO phải được giữ riêng tư.

Tạo một `state_secret` mới bằng:

```bash
openssl rand -base64 48
```

Plugin sử dụng secret này để mã hóa và xác thực giá trị `state` OIDC truyền qua trình duyệt và quay lại từ IdP của bạn.

### Ánh xạ Claim (Claim Map)

Object `oidc.claim_map` cho biết plugin biết các claim OIDC nào sẽ trở thành các trusted header của PTOps. Mỗi giá trị có thể là một tên claim, một đường dẫn dạng chấm (dotted path) hoặc một mảng các tên claim dự phòng.

Ví dụ:

```json
"claim_map": {
	"username": ["preferred_username", "email", "sub"],
	"full_name": ["name", "email"],
	"email": "email",
	"groups": ["groups", "roles"]
}
```

Điều này cho phép plugin hoạt động với các nhà cung cấp sử dụng các tên claim hơi khác nhau. Nếu nhà cung cấp của bạn đưa các nhóm vào một claim tùy chỉnh, hãy trỏ `groups` vào đúng claim đó.

### Ghi chú về Nhà cung cấp (Provider)

[Tài liệu Plugin OIDC PTOps](https://github.com/pixlcore/xyplug-sso-oidc) bao gồm các hướng dẫn thiết lập cho một số nhà cung cấp phổ biến:

- [Okta Guide](https://github.com/pixlcore/xyplug-sso-oidc#okta)
- [Auth0 Guide](https://github.com/pixlcore/xyplug-sso-oidc#auth0)
- [Microsoft Entra ID Guide](https://github.com/pixlcore/xyplug-sso-oidc#microsoft-entra-id)
- [Keycloak Guide](https://github.com/pixlcore/xyplug-sso-oidc#keycloak)
- [AWS Cognito Guide](https://github.com/pixlcore/xyplug-sso-oidc#aws-cognito-hosted-ui)
- [SAML via SSOReady](https://github.com/pixlcore/xyplug-sso-oidc#saml-via-ssoready).

Vui lòng sử dụng các tài liệu đó làm tham chiếu chính cho từng nhà cung cấp cụ thể.

Dưới đây là một số mẹo thiết lập chung:

- Bắt đầu với scope cơ bản `openid profile email`.
- Đảm bảo việc đăng nhập đơn giản hoạt động trước khi thêm nhóm hoặc các claim tùy chỉnh.
- Đảm bảo URL callback của IdP là chính xác `base_app_url` của PTOps, không có thêm đường dẫn nào khác.
- Nếu thiếu nhóm, hãy xác minh xem IdP của bạn thực sự có đưa chúng vào ID token hoặc phản hồi UserInfo hay không trước khi gỡ lỗi các bản đồ nhóm của PTOps.

### Ghi log lỗi và gỡ lỗi Plugin (Plugin Debugging)

Để gỡ lỗi các vấn đề ở phía PTOps, hãy đặt thuộc tính cấu hình [debug_level](config.md#debug_level) thành `9`, đồng thời bật cờ [debug](config.md#debug) toàn cục. PTOps ghi lại thông tin chi tiết SSO tại đây:

```text
/opt/xyops/logs/SSO.log
```

Để có thêm output debug từ plugin, hãy đặt biến môi trường này cho dịch vụ PTOps:

```bash
XYP_SSO_DEBUG=1
```

PTOps ghi lại STDOUT và STDERR thô của plugin ở mức SSO debug level 9, vì vậy hãy cẩn thận với các log này trong môi trường production.
## OAuth2-Proxy

[OAuth2-Proxy](https://github.com/oauth2-proxy/oauth2-proxy) là một proxy xác thực nguồn mở, miễn phí và phổ biến. Nó đứng trước PTOps, chuyển hướng người dùng đến nhà cung cấp định danh của bạn, tạo session proxy đã được xác thực của riêng nó, và chuyển tiếp các trusted header tới PTOps.

OAuth2-Proxy là một lựa chọn tuyệt vời khi khả năng tương thích với nhà cung cấp là ưu tiên hàng đầu. Nó hỗ trợ nhiều nhà cung cấp OIDC, có tài liệu hướng dẫn cụ thể cho các nền tảng phổ biến, và đã được thử nghiệm trong nhiều mô hình triển khai khác nhau. Sự đánh đổi ở đây là bạn đang thêm một dịch vụ khác để vận hành và cấu hình.

### Thử nghiệm cục bộ với Echo Server

Bước đầu tiên là cấu hình và chạy thử nghiệm OAuth2-Proxy trước khi đưa PTOps vào hệ thống. Bạn có thể làm theo [hướng dẫn cài đặt OAuth2-Proxy](https://oauth2-proxy.github.io/oauth2-proxy/installation), hoặc sử dụng cấu hình [Docker Compose](https://docs.docker.com/compose/) sau đây với một nhà cung cấp OIDC chung làm điểm khởi đầu:

```yaml
services:
  oauth2-proxy:
    image: quay.io/oauth2-proxy/oauth2-proxy:latest
    ports: ["4180:4180"]
    environment:
      OAUTH2_PROXY_PROVIDER: "oidc"
      OAUTH2_PROXY_OIDC_ISSUER_URL: "https://_YOUR_OIDC_ISSUER_URL_/"
      OAUTH2_PROXY_CLIENT_ID: "_YOUR_CLIENT_ID_"
      OAUTH2_PROXY_CLIENT_SECRET: "_YOUR_CLIENT_SECRET_"
      OAUTH2_PROXY_REDIRECT_URL: "http://localhost:4180/oauth2/callback"
      OAUTH2_PROXY_SCOPE: "openid profile email"
      OAUTH2_PROXY_COOKIE_SECRET: "_YOUR_COOKIE_SECRET_"
      OAUTH2_PROXY_EMAIL_DOMAINS: "*"
      OAUTH2_PROXY_UPSTREAMS: "http://echo-server:80"
      OAUTH2_PROXY_HTTP_ADDRESS: "0.0.0.0:4180"
      OAUTH2_PROXY_COOKIE_SECURE: "false" # cho kiểm thử dev
      OAUTH2_PROXY_PASS_USER_HEADERS: "true" # gửi X-Forwarded-User/Email/etc
      OAUTH2_PROXY_SET_AUTHORIZATION_HEADER: "true" # chuyển tiếp Bearer trong Authorization nếu có
      OAUTH2_PROXY_PASS_ACCESS_TOKEN: "true" # chuyển tiếp access token nếu có
      OAUTH2_PROXY_SKIP_PROVIDER_BUTTON: "true" # bỏ qua màn hình splash screen
      OAUTH2_PROXY_SKIP_AUTH_ROUTES: "^/(api|files|health|images|js|css|fonts|sounds|codemirror|manifest.webmanifest)(/|$)" # bỏ qua xác thực cho các file tĩnh

  echo-server:
    image: ealen/echo-server
```

Lưu ý cách docker compose này khởi chạy *hai* container riêng biệt: bản thân OAuth2-Proxy, và cả [echo-server](https://hub.docker.com/r/ealen/echo-server). Echo server là một web server truyền qua đơn giản để kiểm thử, nó sẽ gửi ngược siêu dữ liệu yêu cầu về trình duyệt dưới định dạng JSON. Điều này cực kỳ hữu ích cho quy trình thiết lập SSO ban đầu, vì bạn có thể kiểm thử riêng biệt phần triển khai xác thực của mình và xem chính xác những header nào sẽ được chuyển xuống cho PTOps sau khi xác thực.

Hãy xem [tài liệu cấu hình OAuth2-Proxy](https://oauth2-proxy.github.io/oauth2-proxy/configuration/overview/) để biết chi tiết về tất cả các biến môi trường được sử dụng ở trên. OAuth2-Proxy cũng cung cấp một tập hợp các [file thiết lập mẫu](https://github.com/oauth2-proxy/oauth2-proxy/tree/master/contrib/local-environment) rất hữu ích cho các cấu hình cụ thể.

Lưu ý rằng OAuth2-Proxy có [hướng dẫn cụ thể cho một số nhà cung cấp](https://oauth2-proxy.github.io/oauth2-proxy/configuration/providers/) bao gồm GitHub, Google, Microsoft, và các nhà cung cấp khác, vì vậy nếu bạn đang sử dụng một trong các nhà cung cấp định danh đó, hãy đọc phần tương ứng để biết các bước thiết lập cụ thể.

Khi bạn đã có các container docker chạy bình thường, hãy truy cập URL này trên trình duyệt của bạn:

```text
http://localhost:4180/
```

Ban đầu, yêu cầu này sẽ chuyển hướng bạn đến đăng nhập bằng nhà cung cấp định danh của bạn. Sau khi đăng nhập thành công, nó sẽ chuyển tiếp yêu cầu đã được xác thực tới container `echo-server` backend và gửi lại thông tin yêu cầu cho trình duyệt ở định dạng JSON, bao gồm cả các header yêu cầu. Bạn sẽ thấy một nội dung tương tự như thế này trên màn hình của mình, được in đẹp ở đây:

```json
{
	"host": {
		"hostname": "localhost",
		"ip": "::ffff:192.168.148.2",
		"ips": []
	},
	"http": {
		"method": "GET",
		"baseUrl": "",
		"originalUrl": "/",
		"protocol": "http"
	},
	"request": {
		"query": {},
		"cookies": {
			"_oauth2_proxy": "2F5DmA84rnYAoZi********pym6VyPzhVj4zU58w="
		},
		"body": {},
		"headers": {
			"host": "localhost:4180",
			"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ...",
			"accept": "text/html ...",
			"accept-encoding": "gzip, deflate, br, zstd",
			"accept-language": "en-US,en;q=0.9",
			"cookie": "2F5DmA84rnYAoZi********pym6VyPzhVj4zU58w=",
			"x-forwarded-access-token": "gho_C7WF*****3JXT6P",
			"x-forwarded-email": "jhuckaby@example.com",
			"x-forwarded-for": "192.168.148.1",
			"x-forwarded-groups": "pixlcore,pixlcore:owners",
			"x-forwarded-user": "jhuckaby"
		}
	},
	"environment": {}
}
```

Các header quan trọng chúng ta muốn thấy là những header này:

```text
"x-forwarded-email": "jhuckaby@example.com"
"x-forwarded-groups": "pixlcore,pixlcore:owners"
"x-forwarded-user": "jhuckaby"
```

Đây là các trusted header mà PTOps sẽ sử dụng để tự động đăng nhập cho người dùng và tạo/cập nhật tài khoản của họ nếu cần. Nếu bạn thấy các header này trong yêu cầu kiểm thử của mình, hoặc ít nhất là `x-forwarded-email`, thì hệ thống đang hoạt động. Tiếp theo, hãy cấu hình PTOps bằng cách sử dụng phần [Cấu hình](#cau-hinh) chung ở trên, và sau đó hoán đổi `echo-server` bằng dịch vụ PTOps thực tế.

### OAuth2-Proxy với TLS

Bây giờ bạn đã sẵn sàng tích hợp PTOps với OAuth2-Proxy. Bạn có một số tùy chọn để thực hiện việc này. Nếu bạn có một server conductor PTOps duy nhất, cách tốt nhất là chạy OAuth2-Proxy độc lập (standalone). Cách này có ít thành phần chuyển động nhất, và OAuth2-Proxy cũng có thể xử lý việc mã hóa TLS cho bạn. Phần này sẽ trình bày cấu hình đó.

Từ file docker compose của chúng ta hiển thị ở trên, chúng ta sẽ hoán đổi PTOps thay thế cho echo server, thay đổi cổng backend thành `5522` (cổng mặc định của PTOps), tinh chỉnh thêm một vài cài đặt cho TLS, và thêm các file chứng chỉ của bạn. Dưới đây là file docker compose đã cập nhật:

```yaml
services:
  oauth2-proxy:
    image: quay.io/oauth2-proxy/oauth2-proxy:latest
    ports: ["443:4180"] # cổng 443 ở bên ngoài
    environment:
      OAUTH2_PROXY_TLS_CERT_FILE: "/etc/tls.crt" # file chứng chỉ của bạn
      OAUTH2_PROXY_TLS_KEY_FILE: "/etc/tls.key" # file khóa của bạn
      OAUTH2_PROXY_PROVIDER: "oidc"
      OAUTH2_PROXY_OIDC_ISSUER_URL: "https://_YOUR_OIDC_ISSUER_URL_/"
      OAUTH2_PROXY_CLIENT_ID: "_YOUR_CLIENT_ID_"
      OAUTH2_PROXY_CLIENT_SECRET: "_YOUR_CLIENT_SECRET_"
      OAUTH2_PROXY_REDIRECT_URL: "http://localhost:4180/oauth2/callback"
      OAUTH2_PROXY_SCOPE: "openid profile email"
      OAUTH2_PROXY_COOKIE_SECRET: "_YOUR_COOKIE_SECRET_"
      OAUTH2_PROXY_EMAIL_DOMAINS: "_YOUR_EMAIL_DOMAINS_" 
      OAUTH2_PROXY_UPSTREAMS: "http://xyops1:5522" # xyops backend trên cổng 5522
      OAUTH2_PROXY_HTTP_ADDRESS: "0.0.0.0:4180"
      OAUTH2_PROXY_COOKIE_SECURE: "true" # bật cookie bảo mật
      OAUTH2_PROXY_PASS_USER_HEADERS: "true"
      OAUTH2_PROXY_SET_AUTHORIZATION_HEADER: "true"
      OAUTH2_PROXY_PASS_ACCESS_TOKEN: "true"
      OAUTH2_PROXY_SKIP_PROVIDER_BUTTON: "true"
      OAUTH2_PROXY_WHITELIST_DOMAINS: ".yourcompany.com" # thêm domain của bạn
      OAUTH2_PROXY_SKIP_AUTH_ROUTES: "^/(api|health|images|js|css|fonts|sounds|codemirror|manifest.webmanifest)(/|$)"
    volumes:
      - "./tls.crt:/etc/tls.crt:ro"
      - "./tls.key:/etc/tls.key:ro"

  xyops1:
    image: ghcr.io/pixlcore/xyops:latest
    environment:
      XYOPS_hostname: "xyops.yourcompany.com"
      TZ: America/Los_Angeles
    volumes:
      - xy-data:/opt/xyops/data
      - "./xyops-conf:/opt/xyops/conf"
      - "./xyops-logs:/opt/xyops/logs"

volumes:
  xy-data:
```

Một số lưu ý ở đây:

- Cổng bên ngoài đã được thay đổi thành 443.
- Chúng tôi đã đặt `OAUTH2_PROXY_COOKIE_SECURE` thành `true`, vì chúng ta sẽ sử dụng kết nối bảo mật kể từ thời điểm này.
- Bạn sẽ cần trỏ một domain vào proxy, và thêm nó vào `OAUTH2_PROXY_WHITELIST_DOMAINS` (cũng như domain IdP của bạn).
- Tạo các file chứng chỉ TLS của bạn, và đặt chúng ở nơi Docker có thể tìm thấy (xem bên dưới).

Đối với container PTOps, nó cần một vài volume persistent. Volume Docker `xy-data` lưu trữ cơ sở dữ liệu và file dữ liệu của PTOps. Chúng tôi cũng ánh xạ các thư mục máy chủ cục bộ cho cấu hình và log (`./xyops-conf` và `./xyops-logs`). Vui lòng thay đổi các đường dẫn đó thành các vị trí thích hợp trên máy chủ nơi bạn muốn lưu trữ các file này. Khởi chạy container một lần, và nó sẽ tự động tạo tất cả các file cấu hình cho bạn. Sau đó, xem [Hướng dẫn Cấu hình PTOps](config.md) để biết chi tiết về cách tùy chỉnh các file này. Các file chứng chỉ TLS cũng nằm trong thư mục này.

Ít nhất, hãy đảm bảo rằng bạn đã đặt thuộc tính [base_app_url](config.md#base_app_url) thành domain định tuyến tới proxy (đứng trước), với tiền tố `https://`. Bạn cũng nên đặt `XYOPS_hostname` thành cùng tên hostname đó (không có tiền tố giao thức). Đây là thông tin PTOps sử dụng để tự quảng bá chính nó tới server cluster, và tạo URL cho các server mới kết nối.

Trong trường hợp này, vì chúng ta chỉ chạy một server conductor duy nhất, chúng ta có thể định tuyến *mọi thứ* qua proxy, giúp mọi việc trở nên đơn giản hơn. Bạn thậm chí không cần phải expose bất kỳ cổng nào trên container PTOps. Người dùng truy cập đường dẫn URI gốc `/` và được xác thực qua SSO, còn các cuộc gọi API và kết nối server đều truy cập tiền tố `/api`, vốn được định tuyến trực tiếp qua PTOps, và ứng dụng sẽ sử dụng lớp xác thực của riêng nó (API key, token, v.v.).

**Nâng cao**: Đối với các hệ thống cài đặt có số lượng lớn server worker, tốt hơn là expose container PTOps dưới một domain nội bộ riêng của nó, và để các server worker kết nối trực tiếp đến đó, thay vì đi qua OAuth2-Proxy. Thay đổi biến môi trường `XYOPS_hostname` để trỏ đến domain PTOps chuyên dụng nhằm thay đổi cách nó tự quảng bá tới cluster.

### Đa Conductor với OAuth2-Proxy và TLS với Nginx

Đối với thiết lập đa conductor cân bằng tải sử dụng Nginx với TLS và OAuth-Proxy cho SSO, vui lòng đọc phần này. Đây chắc chắn là thiết lập phức tạp nhất, và yêu cầu kiến thức nâng cao về tất cả các thành phần được sử dụng. Chúng tôi khuyên dùng [Gói Enterprise](https://xyops.io/pricing) của chúng tôi nếu bạn muốn chúng tôi thiết lập toàn bộ phần này cho bạn. Cách cấu hình này hoạt động như sau:

- [Nginx](https://nginx.org/) đứng trước, và xử lý việc giải mã TLS, cũng như định tuyến các yêu cầu đến các backend khác nhau.
- [OAuth2-Proxy](https://github.com/oauth2-proxy/oauth2-proxy) xử lý SSO, và được tích hợp qua Nginx bằng chỉ thị [auth_request](https://nginx.org/en/docs/http/ngx_http_auth_request_module.html).
	- Nghĩa là, OAuth2-Proxy đứng "ở bên cạnh" luồng yêu cầu, và được tham vấn để xác thực, sau đó yêu cầu được định tuyến từ Nginx tới PTOps.
	- Khi Nginx định tuyến yêu cầu đã được xác thực tới PTOps, nó sẽ chuyển tiếp các "trusted header" để tự động tạo user / đăng nhập user.
- Nginx xử lý đa conductor của PTOps bằng cách sử dụng một [Health Check Daemon](https://github.com/pixlcore/xyops-healthcheck) được nhúng chạy trong cùng một container.
	- Health check theo dõi xem server nào là conductor chính (primary), và tự động cấu hình lại cũng như tải lại (hot-reload) Nginx khi cần thiết.
	- Chúng tôi duy trì Docker image Nginx tùy chỉnh của riêng mình cho việc này (hiển thị bên dưới), hoặc bạn có thể [tự build từ source](https://github.com/pixlcore/xyops-nginx-sso/blob/main/Dockerfile).

Một số điều kiện tiên quyết cho thiết lập này:

- Đối với các thiết lập đa conductor, **bạn phải có bộ lưu trữ ngoài dùng chung**. Đối với môi trường production thực tế, chúng tôi khuyên dùng thiết lập lưu trữ Hybrid sử dụng Redis hoặc Postgres cho dữ liệu JSON, cùng với S3 hoặc một dịch vụ tương thích S3 cho các file. Không sử dụng các volume Docker cục bộ cho cấu hình đa conductor. Xem [Thiết lập Lưu trữ](storage.md) để biết chi tiết.
- Bạn sẽ cần một domain tùy chỉnh được cấu hình và các chứng chỉ TLS được tạo sẵn sàng để đính kèm.
- Bạn đã tùy chỉnh các file cấu hình PTOps sẵn sàng hoạt động ([config.json](https://github.com/pixlcore/xyops/blob/main/sample_conf/config.json) và [sso.json](https://github.com/pixlcore/xyops/blob/main/sample_conf/sso.json)) (xem bên dưới để biết chi tiết).
- Và tất nhiên, bạn nên có một cấu hình SSO đã được thử nghiệm trước cho OAuth2-Proxy, nhờ đó bạn tự tin rằng thành phần đó hoạt động trước khi tích hợp nó vào đây.

Đối với các ví dụ bên dưới, chúng tôi sẽ sử dụng các placeholder domain sau:

- `xyops.yourcompany.com` - Domain hướng tới người dùng sẽ định tuyến tới Nginx / SSO.
- `xyops01.yourcompany.com` - Domain nội bộ cho server conductor số 1.
- `xyops02.yourcompany.com` - Domain nội bộ cho server conductor số 2.

Lý do tại sao các server conductor mỗi cái cần một tên domain nội bộ duy nhất của riêng nó là vì cách hoạt động của hệ thống đa conductor. Mỗi server conductor cần phải được định danh riêng lẻ, và có thể kết nối được bởi tất cả các server worker trong tổ chức của bạn. Các server worker không biết hoặc không quan tâm đến Nginx, vì chúng kết nối trực tiếp đến các conductor và có hệ thống tự động failover riêng. Ngoài ra, các server worker sử dụng một kết nối WebSocket persistent, và có thể gửi một lượng lớn lưu lượng truy cập, tùy thuộc vào số lượng server worker bạn có và số lượng job bạn chạy. Vì những lý do này, tốt hơn là để các server worker kết nối trực tiếp đến các conductor, đặc biệt là ở quy mô production.

Mặc dù vậy, bạn *có thể* cấu hình các server worker của mình để kết nối thông qua cổng Nginx phía trước nếu bạn muốn. Điều này có thể hữu ích nếu bạn có các server worker ở một mạng khác hoặc ngoài môi trường công cộng, nhưng nó không được khuyến nghị cho hầu hết các thiết lập. Để làm điều này, vui lòng xem [Ghi đè URL Kết nối](hosting.md#overriding-the-connect-url) trong hướng dẫn tự triển khai của chúng tôi.

Dưới đây là một file docker compose để chạy Nginx và OAuth2-Proxy trong cấu hình phù hợp cho đa conductor với TLS và SSO. PTOps chưa được đưa vào vì nó sẽ chạy riêng biệt.

```yaml
services:
  nginx:
    image: ghcr.io/pixlcore/xyops-nginx-sso:latest
    depends_on:
      - oauth2-proxy
    init: true
    environment:
      XYOPS_masters: xyops01.yourcompany.com,xyops02.yourcompany.com
      XYOPS_port: 5522
    volumes:
      - "./tls.crt:/etc/tls.crt:ro"
      - "./tls.key:/etc/tls.key:ro"
    ports:
      - "443:443"

  oauth2-proxy:
    image: quay.io/oauth2-proxy/oauth2-proxy:latest
    environment:
      OAUTH2_PROXY_PROVIDER: "oidc"
      OAUTH2_PROXY_OIDC_ISSUER_URL: "https://_YOUR_OIDC_ISSUER_URL_/"
      OAUTH2_PROXY_CLIENT_ID: "_YOUR_CLIENT_ID_"
      OAUTH2_PROXY_CLIENT_SECRET: "_YOUR_CLIENT_SECRET_"
      OAUTH2_PROXY_REDIRECT_URL: "https://xyops.yourcompany.com/oauth2/callback"
      OAUTH2_PROXY_SCOPE: "openid profile email"
      OAUTH2_PROXY_COOKIE_SECRET: "_YOUR_COOKIE_SECRET_"
      OAUTH2_PROXY_EMAIL_DOMAINS: "_YOUR_EMAIL_DOMAINS_" 
      OAUTH2_PROXY_UPSTREAMS: "static://200" # no-op
      OAUTH2_PROXY_HTTP_ADDRESS: "0.0.0.0:4180"
      OAUTH2_PROXY_REVERSE_PROXY: "true"
      OAUTH2_PROXY_COOKIE_SECURE: "true" # sử dụng cookie bảo mật
      OAUTH2_PROXY_PASS_USER_HEADERS: "true"
      OAUTH2_PROXY_SET_AUTHORIZATION_HEADER: "true"
      OAUTH2_PROXY_SET_XAUTHREQUEST: "true"
      OAUTH2_PROXY_PASS_ACCESS_TOKEN: "true"
      OAUTH2_PROXY_SKIP_PROVIDER_BUTTON: "true"
      OAUTH2_PROXY_WHITELIST_DOMAINS: ".yourcompany.com" # thêm domain của bạn
```

Hãy nói về thiết lập Nginx trước. Chúng tôi đang sử dụng Docker image của riêng mình ở đây ([xyops-nginx-sso](https://github.com/pixlcore/xyops-nginx-sso)). Đây là bản build bao bọc xung quanh image Nginx chính thức, nhưng nó bao gồm daemon [Health Check PTOps](https://github.com/pixlcore/xyops-healthcheck) của chúng tôi. Health check giám sát server conductor nào hiện đang là master chính, và tự động cấu hình lại Nginx ngay lập tức khi cần thiết (để Nginx luôn chỉ định tuyến đến server chính hiện tại). Image cũng đi kèm với một Nginx được cấu hình sẵn hoàn chỉnh, nó sẽ gọi tới OAuth2-Proxy thông qua cơ chế [auth_request](http://nginx.org/en/docs/http/ngx_http_auth_request_module.html). Để sử dụng image này, bạn sẽ cần cung cấp:

- Các file chứng chỉ TLS của bạn, được đặt tên là `tls.crt` và `tls.key`, lần lượt được ánh xạ tới `/etc/tls.crt` và `/etc/tls.key`.
- Danh sách các tên domain của server conductor PTOps, dưới dạng một danh sách phân tách bằng dấu phẩy trong biến môi trường `XYOPS_masters` (được sử dụng bởi health check).

Tiếp theo là thiết lập OAuth2-Proxy (chúng tôi sử dụng image Docker chính thức ở đây). Cấu hình phần lớn đã được thảo luận ở trên, nhưng có một vài điểm mấu chốt cần chỉ ra lần này:

- `OAUTH2_PROXY_UPSTREAMS` được đặt thành một phản hồi tĩnh (`static://200`). Điều này là do ở chế độ [auth_request](http://nginx.org/en/docs/http/ngx_http_auth_request_module.html), OAuth2-Proxy không giao tiếp trực tiếp với backend. Thay vào đó, Nginx thực hiện các "yêu cầu phụ" tới nó để xác thực, và sau đó bản thân Nginx sẽ định tuyến các yêu cầu đã được xác thực tới backend thực tế.
- `OAUTH2_PROXY_REVERSE_PROXY` được đặt thành `true`. Điều này là bắt buộc để chạy OAuth2-Proxy trong chế độ auth_request.
- `OAUTH2_PROXY_SET_XAUTHREQUEST` được đặt thành `true`. Điều này trả về tập hợp các trusted header trong chế độ auth_request.
- `OAUTH2_PROXY_SKIP_AUTH_ROUTES` đã được gỡ bỏ, vì OAuth2-Proxy không thực sự thực hiện bất kỳ định tuyến nào trong cấu hình này.

Khi bạn đã có hai thành phần đó chạy ổn định, chúng ta có thể khởi động PTOps backend. Phần này được liệt kê riêng biệt vì bạn thường muốn chạy các dịch vụ này trên các server chuyên dụng. Trước khi khởi động nhiều conductor, hãy cấu hình PTOps để sử dụng bộ lưu trữ ngoài dùng chung như được mô tả trong [Hướng dẫn Thiết lập Lưu trữ](storage.md). Dưới đây là cấu hình đa conductor dưới dạng một file Docker compose duy nhất. Đối với các server conductor bổ sung, bạn có thể nhân bản dịch vụ này, thay đổi hostname, và trỏ từng conductor vào cùng một cấu hình lưu trữ dùng chung:

```yaml
services:
  xyops1:
    image: ghcr.io/pixlcore/xyops:latest
    hostname: xyops01.yourcompany.com # thay đổi thuộc tính này trên mỗi server conductor
    init: true
    environment:
      XYOPS_masters: xyops01.yourcompany.com,xyops02.yourcompany.com
      TZ: America/Los_Angeles
    volumes:
      - "./xyops-conf:/opt/xyops/conf"
      - "./xyops-logs:/opt/xyops/logs"
    ports:
      - "5522:5522"
      - "5523:5523"
```

Một số điểm cần lưu ý ở đây:

- Chúng tôi đang sử dụng Docker image chính thức của PTOps, nhưng bạn luôn có thể [tự build từ source](https://github.com/pixlcore/xyops/blob/main/Dockerfile).
- Tất cả các hostname của server conductor cần phải được liệt kê trong biến môi trường `XYOPS_masters`, phân tách bằng dấu phẩy.
- Tất cả các server conductor cần phải định tuyến được tới nhau thông qua hostname của chúng, để chúng có thể tự đàm phán và tổ chức bầu cử.
- Tất cả các server conductor phải sử dụng cùng một cấu hình bộ lưu trữ ngoài dùng chung. Không mount các volume `/opt/xyops/data` cục bộ riêng biệt cho mỗi conductor, vì điều đó sẽ tạo ra tình trạng phân mảnh dữ liệu (split-brain).
- Múi giờ (`TZ`) nên được đặt thành múi giờ chính của công ty bạn, để các công việc như xoay vòng log vào nửa đêm và reset số liệu thống kê hàng ngày hoạt động như mong đợi.

Đối với container PTOps, chúng tôi đang ánh xạ các thư mục máy chủ cục bộ cho cấu hình và log (`./xyops-conf` và `./xyops-logs`). Vui lòng thay đổi các đường dẫn đó thành các vị trí thích hợp trên máy chủ nơi bạn muốn lưu trữ các file này. Khởi chạy container một lần, và nó sẽ tự động tạo tất cả các file cấu hình cho bạn. Sau đó cấu hình bộ lưu trữ ngoài dùng chung trong `./xyops-conf/config.json` trước khi khởi chạy nhiều conductor. Xem [Hướng dẫn Cấu hình PTOps](config.md) và [Hướng dẫn Thiết lập Lưu trữ](storage.md) để biết chi tiết. Tuy nhiên, hãy nói cụ thể về `sso.json` cho cấu hình này. File này phần lớn đã được thảo luận ở trên (xem [Cấu hình](#cau-hinh)), nhưng đặc biệt là [Ánh xạ Header](#anh-xa-header-header-map) sẽ khác đối với Nginx + OAuth2-Proxy:

```json
"header_map": {
	"username": "x-auth-request-user",
	"full_name": "x-auth-request-user",
	"email": "x-auth-request-email",
	"groups": "x-auth-request-groups"
}
```

Hãy lưu ý tên các header yêu cầu có sự khác biệt; tất cả chúng đều có tiền tố `x-auth-request-`. Đây là cách Nginx chuyển tiếp các trusted header như một tác động phụ khi nó sử dụng OAuth2-Proxy thông qua cơ chế [auth_request](http://nginx.org/en/docs/http/ngx_http_auth_request_module.html). Vì vậy, bạn sẽ phải sử dụng kiểu header này trong `header_map` để ánh xạ chính xác các trường người dùng.

**Nâng cao:** PTOps thực sự thực hiện việc giải mã TLS của riêng nó trong web server tích hợp sẵn, và host HTTPS trên cổng 5523. Cổng này được sử dụng bởi các server worker kết nối trực tiếp đến conductor. Theo mặc định, PTOps được cấu hình với một chứng chỉ tự ký, vốn được hỗ trợ bởi phần mềm satellite của chúng tôi ([xySat](https://github.com/pixlcore/xysat)). Tuy nhiên, bạn có thể thay đổi tất cả những điều này, và đưa các chứng chỉ có chữ ký để sử dụng trên các server conductor của bạn, cũng như cấu hình các server worker để từ chối các chứng chỉ tự ký. Để biết thêm thông tin, xem [Hướng dẫn Tự triển khai - TLS](hosting.md#tls).

### Khắc phục sự cố

Để khắc phục sự cố cho OAuth2-Proxy, hãy đặt các biến môi trường này để bật thêm nhật ký gỡ lỗi (debug logging):

```
OAUTH2_PROXY_STANDARD_LOGGING: "true"
OAUTH2_PROXY_AUTH_LOGGING: "true"
OAUTH2_PROXY_REQUEST_LOGGING: "true"
OAUTH2_PROXY_SHOW_DEBUG_ON_ERROR: "true"
```

Để gỡ lỗi các vấn đề ở phía PTOps, hãy đặt thuộc tính cấu hình [debug_level](config.md#debug_level) thành `9`, và bật cờ [debug](config.md#debug) toàn cục. Các tùy chọn này cũng có thể được đặt bằng các biến môi trường:

```
XYOPS_debug_level: 9
XYOPS_debug: true
```

Điều này sẽ cho phép PTOps ghi lại nhiều thông tin hơn về quy trình SSO, bao gồm cả tất cả các header yêu cầu gửi đến. PTOps thực sự ghi lại vào một log SSO chuyên dụng mà bạn có thể tìm thấy tại đây:

```
/opt/xyops/logs/SSO.log
```

## Authentik

[Authentik](https://goauthentik.io/) là một lựa chọn tuyệt vời khác cho SSO của PTOps. Nó có thể đóng vai trò vừa là nhà cung cấp định danh (identity provider) của bạn vừa là proxy xác thực trước cổng của bạn. Trong thiết lập này, người dùng kết nối tới Authentik trước, Authentik xác thực họ, sau đó Proxy Provider của nó sẽ chuyển tiếp yêu cầu tới PTOps cùng với các trusted header đính kèm.

Authentik cũng hỗ trợ các tính năng xác thực nâng cao như MFA / 2FA, các ứng dụng xác thực TOTP, các token khôi phục tĩnh, các giai đoạn SMS và Duo, WebAuthn / FIDO2 / Passkeys, các khóa bảo mật như YubiKey, các trình xác thực nền tảng như Touch ID, Face ID và Windows Hello, đăng nhập không mật khẩu, và tự động điền passkey trong các trình duyệt được hỗ trợ. Các tính năng này được cấu hình trong các luồng (flow) và giai đoạn (stage) của Authentik, và tất cả đều diễn ra trước khi PTOps nhận được yêu cầu đã xác thực.

**Lưu ý về Tài nguyên:** Authentik là một nền tảng xác thực và nhà cung cấp định danh đầy đủ, do đó nó tốn tài nguyên hơn một proxy xác thực nhẹ. Yêu cầu Docker Compose chính thức của Authentik hiện khuyến nghị ít nhất 2 nhân CPU và 2 GB RAM. Đối với các bản cài đặt PTOps tự chạy cho một người dùng hoặc đội ngũ rất nhỏ, mức tài nguyên này có thể lớn hơn mức bạn muốn. Trong trường hợp đó, OAuth2-Proxy, Authelia, Tailscale hoặc một proxy trusted-header đơn giản hơn có thể là lựa chọn phù hợp hơn.

Phần này tập trung vào thiết lập một conductor đơn giản, với Authentik đứng ngay trước PTOps sử dụng outpost proxy nhúng (embedded proxy outpost). Không cần Nginx cho phiên bản này. Authentik cũng có các chế độ forward-auth và outpost bên ngoài nâng cao hơn, nhưng những chế độ đó tốt nhất nên được xử lý dưới dạng một đợt triển khai nâng cao riêng biệt.

### Cách thức hoạt động

Luồng yêu cầu trông như thế này:

1. Người dùng duyệt đến URL bên ngoài của PTOps, chẳng hạn như `https://xyops.yourcompany.com/`.
2. Domain đó trỏ đến container server Authentik, không trỏ trực tiếp đến PTOps.
3. Outpost proxy nhúng của Authentik phát hiện ra host đó thuộc về ứng dụng PTOps.
4. Nếu người dùng chưa đăng nhập, Authentik sẽ chuyển hướng họ qua luồng đăng nhập của nó.
5. Sau khi đăng nhập, Authentik proxy yêu cầu tới PTOps (`xyops1:5522` trong ví dụ của chúng ta).
6. Authentik chèn các trusted header như `x-authentik-username`, `x-authentik-email`, `x-authentik-name`, và `x-authentik-groups`.
7. PTOps ánh xạ các header đó tới một tài khoản người dùng cục bộ và bắt đầu session của riêng nó.

Điều quan trọng cần hiểu là Authentik là web server đối diện với công chúng trong thiết lập này. PTOps chỉ có thể kết nối được trên mạng Docker riêng tư, và nó chỉ tin tưởng các header đến từ Authentik.

Thông thường bạn sẽ có hai hostname có thể duyệt được bằng trình duyệt:

- `xyops.yourcompany.com` là URL ứng dụng PTOps công khai. Người dùng bookmark URL này, và Authentik proxy nó tới container PTOps riêng tư.
- `auth.yourcompany.com` là URL của riêng Authentik. Người dùng được chuyển hướng đến đây cho các luồng đăng nhập, và các admin sử dụng nó để cấu hình Authentik.

Điều này tương tự như việc sử dụng một nhà cung cấp định danh bên ngoài riêng biệt, chẳng hạn như Okta hoặc Google. Sự khác biệt là bạn cũng đang tự host nhà cung cấp định danh đó, vì vậy nó cần hostname riêng của mình. Việc cố gắng sử dụng duy nhất `xyops.yourcompany.com` cho cả PTOps và UI admin/login của Authentik chỉ khả thi với định tuyến dựa trên đường dẫn nâng cao hơn, và điều đó thường đồng nghĩa với việc đưa thêm Nginx hoặc một reverse proxy khác vào. Đối với thiết lập đơn giản không dùng Nginx này, hãy sử dụng hai hostname.

### Docker Compose

Dưới đây là một ví dụ Docker Compose hoàn chỉnh để chạy Authentik và PTOps cùng nhau. File này dựa trên bố cục Docker Compose chính thức của Authentik, cộng thêm một container PTOps. Đối với môi trường production, hãy cố định `AUTHENTIK_TAG` thành một bản phát hành Authentik cụ thể thay vì sử dụng phiên bản hiện hành khi bạn sao chép file này.

Tạo một file `.env` cạnh file compose của bạn:

```bash
PG_PASS=_GENERATE_A_LONG_RANDOM_PASSWORD_
AUTHENTIK_SECRET_KEY=_GENERATE_A_LONG_RANDOM_SECRET_
AUTHENTIK_TAG=2026.2.2

# Tùy chọn: expose Authentik trên các cổng HTTP/HTTPS thông thường.
# Đối với kiểm thử cục bộ, bạn có thể để trống các biến này và sử dụng 9000/9443 thay thế.
COMPOSE_PORT_HTTP=80
COMPOSE_PORT_HTTPS=443
```

Các tên `COMPOSE_PORT_HTTP` và `COMPOSE_PORT_HTTPS` được sử dụng bởi file Docker Compose chính thức của Authentik. Chúng là các biến thay thế Docker Compose cho các cổng máy chủ được exposed, không phải là các cài đặt ứng dụng Authentik. Bản thân Authentik vẫn lắng nghe bên trong container trên cổng `9000` cho HTTP và `9443` cho HTTPS trừ khi bạn thay đổi cấu hình nội bộ của nó một cách riêng biệt.

Bạn có thể tạo các secret bằng `openssl`:

```bash
echo "PG_PASS=$(openssl rand -base64 36 | tr -d '\n')" >> .env
echo "AUTHENTIK_SECRET_KEY=$(openssl rand -base64 60 | tr -d '\n')" >> .env
```

Sau đó tạo file `compose.yml`:

```yaml
services:
  postgresql:
    image: docker.io/library/postgres:16-alpine
    restart: unless-stopped
    env_file:
      - .env
    environment:
      POSTGRES_DB: ${PG_DB:-authentik}
      POSTGRES_PASSWORD: ${PG_PASS:?database password required}
      POSTGRES_USER: ${PG_USER:-authentik}
    healthcheck:
      test:
        - CMD-SHELL
        - pg_isready -d $${POSTGRES_DB} -U $${POSTGRES_USER}
      start_period: 20s
      interval: 30s
      retries: 5
      timeout: 5s
    volumes:
      - database:/var/lib/postgresql/data

  authentik:
    image: ghcr.io/goauthentik/server:${AUTHENTIK_TAG:-2026.2.2}
    command: server
    restart: unless-stopped
    depends_on:
      postgresql:
        condition: service_healthy
    env_file:
      - .env
    environment:
      AUTHENTIK_POSTGRESQL__HOST: postgresql
      AUTHENTIK_POSTGRESQL__NAME: ${PG_DB:-authentik}
      AUTHENTIK_POSTGRESQL__PASSWORD: ${PG_PASS}
      AUTHENTIK_POSTGRESQL__USER: ${PG_USER:-authentik}
      AUTHENTIK_SECRET_KEY: ${AUTHENTIK_SECRET_KEY:?secret key required}
    ports:
      # Authentik lắng nghe nội bộ trên HTTP 9000 và HTTPS 9443.
      # Đặt COMPOSE_PORT_HTTP=80 và COMPOSE_PORT_HTTPS=443 trong .env cho production.
      - ${COMPOSE_PORT_HTTP:-9000}:9000
      - ${COMPOSE_PORT_HTTPS:-9443}:9443
    volumes:
      - ./authentik-data:/data
      - ./authentik-custom-templates:/templates

  authentik-worker:
    image: ghcr.io/goauthentik/server:${AUTHENTIK_TAG:-2026.2.2}
    command: worker
    restart: unless-stopped
    depends_on:
      postgresql:
        condition: service_healthy
    env_file:
      - .env
    environment:
      AUTHENTIK_POSTGRESQL__HOST: postgresql
      AUTHENTIK_POSTGRESQL__NAME: ${PG_DB:-authentik}
      AUTHENTIK_POSTGRESQL__PASSWORD: ${PG_PASS}
      AUTHENTIK_POSTGRESQL__USER: ${PG_USER:-authentik}
      AUTHENTIK_SECRET_KEY: ${AUTHENTIK_SECRET_KEY:?secret key required}
    user: root
    volumes:
      # Authentik sử dụng socket Docker cho các outpost được quản lý.
      # Outpost tích hợp được sử dụng ở đây không yêu cầu nghiêm ngặt điều này,
      # nhưng việc này giúp giữ file compose đồng nhất với thiết lập chính thức của Authentik.
      - /var/run/docker.sock:/var/run/docker.sock
      - ./authentik-data:/data
      - ./authentik-certs:/certs
      - ./authentik-custom-templates:/templates

  xyops1:
    image: ghcr.io/pixlcore/xyops:latest
    restart: unless-stopped
    init: true
    environment:
      # Đây phải là hostname PTOps công khai mà người dùng duyệt đến.
      XYOPS_hostname: xyops.yourcompany.com
      TZ: America/Los_Angeles
    volumes:
      - xy-data:/opt/xyops/data
      - "./xyops-conf:/opt/xyops/conf"
      - "./xyops-logs:/opt/xyops/logs"
    expose:
      # Chỉ expose PTOps cho mạng Docker riêng tư.
      # Authentik sẽ proxy các yêu cầu tới cổng này.
      - "5522"

volumes:
  xy-data:
  database:
    driver: local
```

Khởi động mọi thứ bằng:

```bash
docker compose pull
docker compose up -d
```

Sau đó mở URL thiết lập ban đầu của Authentik:

```
http://auth.yourcompany.com/if/flow/initial-setup/
```

Đối với kiểm thử cục bộ trên cổng được ánh xạ mặc định, hãy sử dụng các hostname riêng biệt cho Authentik và PTOps, để Authentik có thể định tuyến dựa trên header `Host`. Bạn có thể thêm một nội dung tương tự như thế này vào `/etc/hosts`:

```
127.0.0.1 auth.localhost xyops.localhost
```

Sau đó mở:

```
http://auth.localhost:9000/if/flow/initial-setup/
```

Tạo mật khẩu `akadmin` ban đầu, sau đó đăng nhập vào UI admin của Authentik.

### Thiết lập Ứng dụng Authentik

Trong Authentik, tạo một ứng dụng (application) mới và proxy provider cho PTOps:

1. Vào mục **Applications**, chọn tiếp **Applications**, sau đó nhấp vào **Create**.
2. Nhập một tên như `PTOps`.
3. Nhập một slug như `xyops`.
4. Với mục **Provider**, chọn **Create new Provider**.
5. Chọn **Proxy Provider**.
6. Đặt **Name** thành `PTOps Proxy`.
7. Đặt **Mode** thành **Proxy**.
8. Đặt **External host** thành URL PTOps công khai của bạn:

```
https://xyops.yourcompany.com
```

Đối với kiểm thử HTTP cục bộ, sử dụng:

```
http://xyops.localhost:9000
```

9. Đặt **Internal host** thành URL mạng Docker cho PTOps:

```
http://xyops1:5522
```

10. Nếu host nội bộ của bạn là HTTP thông thường, hãy để tùy chọn **Internal host SSL Validation** tắt hoặc không liên quan.
11. Trong mục **Unauthenticated Paths**, thêm các đường dẫn PTOps cần bypass qua Authentik:

```regex
^/api(/|$)
^/files(/|$)
^/health(/|$)
^/images(/|$)
^/js(/|$)
^/css(/|$)
^/fonts(/|$)
^/sounds(/|$)
^/codemirror(/|$)
^/manifest\.webmanifest$
```

Đây là những đường dẫn tương đương với `OAUTH2_PROXY_SKIP_AUTH_ROUTES` của OAuth2-Proxy trong Authentik. Đường dẫn `/api` đặc biệt quan trọng, vì các API key của PTOps, các token của server worker, và các yêu cầu không phải trình duyệt khác đều được xử lý bởi chính PTOps.

Sau khi lưu provider và ứng dụng, hãy đảm bảo ứng dụng đã được gán cho một outpost:

1. Vào mục **Applications**, chọn tiếp **Outposts**.
2. Chỉnh sửa **authentik Embedded Outpost**.
3. Bên dưới mục **Applications**, thêm ứng dụng `PTOps` của bạn.
4. Kiểm tra cấu hình outpost và đảm bảo `authentik_host` là một URL đầy đủ cho bản cài đặt Authentik của bạn, chẳng hạn như:

```
https://auth.yourcompany.com/
```

Đối với kiểm thử cục bộ:

```
http://auth.localhost:9000/
```

Lưu outpost. Authentik bây giờ sẽ định tuyến các yêu cầu cho external host của provider thông qua outpost được nhúng và chuyển tiếp tới PTOps.

### Cấu hình Authentik SSO

Proxy Provider của Authentik gửi các trusted header mà PTOps cần, nhưng các tên header khác với OAuth2-Proxy. Cấu hình file `./xyops-conf/sso.json` như thế này:

```json
{
	"enabled": true,
	"whitelist": ["172.16.0.0/12"],
	"header_map": {
		"username": "x-authentik-username",
		"full_name": "x-authentik-name",
		"email": "x-authentik-email",
		"groups": "x-authentik-groups"
	},
	"cleanup_username": false,
	"cleanup_full_name": false,
	"group_role_separator": "|",
	"group_role_map": {},
	"group_privilege_map": {},
	"replace_roles": false,
	"replace_privileges": false,
	"admin_bootstrap": "akadmin",
	"logout_url": "/outpost.goauthentik.io/sign_out",
	"command": "",
	"preset": ""
}
```

Một số lưu ý quan trọng:

- Tên header không phân biệt chữ hoa chữ thường trong HTTP, nhưng PTOps lưu trữ chúng dưới dạng chữ thường nội bộ, do đó hãy sử dụng tên viết thường trong `header_map`.
- Authentik gửi các nhóm được phân tách bằng các ký tự pipe, chẳng hạn như `engineering|platform|admins`, do đó hãy đặt `group_role_separator` thành `|`.
- `admin_bootstrap` là tùy chọn, nhưng nó rất tiện lợi cho lần đăng nhập đầu tiên. Đặt nó thành chính xác username Authentik của bạn, đăng nhập một lần, cấu hình các role và privilege, sau đó gỡ bỏ nó.
- `logout_url` trỏ đến endpoint đăng xuất proxy của Authentik. Khi người dùng nhấp vào đăng xuất trong PTOps, họ sẽ được gửi đến đó để Authentik cũng có thể xóa session proxy của nó.
- Cấu hình `whitelist` ở trên tin tưởng các địa chỉ mạng riêng tư của Docker. Đối với môi trường production, hãy thắt chặt phần này thành dải mạng container hoặc mạng proxy thực tế của Authentik nếu bạn có thể. Xem [Môi trường Production](#moi-truong-production) bên dưới để biết chi tiết.

Cũng đảm bảo file `./xyops-conf/config.json` có thuộc tính [base_app_url](config.md#base_app_url) được đặt thành cùng một URL công khai bạn đã sử dụng trong **External host** của Authentik:

```json
"base_app_url": "https://xyops.yourcompany.com"
```

Khởi động lại PTOps sau khi thay đổi `sso.json` hoặc `config.json`:

```bash
docker compose restart xyops1
```

### Kiểm thử Authentik

Khi Authentik và PTOps đã được cấu hình, hãy duyệt đến:

```
https://xyops.yourcompany.com/
```

Bạn sẽ được chuyển hướng đến Authentik, được yêu cầu đăng nhập, và sau đó được chuyển tiếp vào lại PTOps. PTOps sẽ tạo hoặc cập nhật tài khoản người dùng của bạn từ các header của Authentik.

Nếu bạn gặp sự cố, hãy tăng mức độ log gỡ lỗi SSO của PTOps:

```
XYOPS_debug_level: 9
```

Sau đó theo dõi:

```
/opt/xyops/logs/SSO.log
```

Ở phía Authentik, hãy kiểm tra log container server `authentik`. Nếu bạn cần kiểm tra chính xác những gì outpost đang thực hiện, hãy đặt mức log của outpost tích hợp thành `trace` tạm thời. Authentik cũng cung cấp một endpoint kiểm tra nhanh trạng thái hoạt động (health check) của outpost:

```
https://xyops.yourcompany.com/outpost.goauthentik.io/ping
```

Một outpost hoạt động bình thường sẽ trả về một phản hồi thành công `204` trống.

## SAML

Nếu bạn yêu cầu [SAML](https://en.wikipedia.org/wiki/Security_Assertion_Markup_Language) cho thiết lập SSO của mình, chúng tôi khuyên bạn nên sử dụng [SSOReady](https://ssoready.com/), vốn có thể dễ dàng tích hợp với [OAuth2-Proxy](https://github.com/oauth2-proxy/oauth2-proxy). Về cơ bản, SSOReady cung cấp một "cầu nối SAML sang OIDC" mà OAuth2-Proxy có thể giao tiếp trực tiếp, tương tự như bất kỳ nhà cung cấp định danh OIDC nào khác. SSOReady là miễn phí, [nguồn mở](https://github.com/ssoready/ssoready), và [có thể tự host](https://ssoready.com/docs/self-hosting-ssoready) nếu bạn muốn, nhưng [phiên bản cloud có host sẵn](https://ssoready.com/pricing) của họ cũng cực kỳ tốt. Hướng dẫn này bao gồm mọi thứ bạn cần để bắt đầu hoạt động với SAML.

### Điều kiện tiên quyết

- Một tài khoản [SSOReady](https://ssoready.com/) (hoặc tự host nó) và một "Environment".
- Một SAML IdP bên ngoài (ví dụ: Okta, Entra ID, OneLogin) được cấu hình trong SSOReady.
- Docker / Docker Compose chạy cục bộ.

### Thiết lập SSOReady

1. **Tạo tài khoản / environment**
	- Đăng ký / đăng nhập tại `https://app.ssoready.com/`.
	- Tạo một environment (ví dụ: "Dev"). Tất cả các key bạn tạo đều nằm trong một environment.
2. **Tạo Tổ chức (Organization) của bạn**
	- Trong portal SSOReady, tạo một Organization.
	- Đặt hoặc lưu lại giá trị `organization_external_id` (ví dụ: `acme`).
	- Bạn sẽ truyền giá trị này trên yêu cầu ủy quyền để SSOReady biết kết nối SAML *nào* cần sử dụng.
3. **Tạo một "SAML OAuth Client"**
	- Vào mục "API Keys", chọn tiếp "Create SAML OAuth Client".
	- Sao chép các giá trị này:
		- **Client ID**: trông tương tự như `saml_oauth_client_...`
		- **Client Secret**: trông tương tự như `ssoready_oauth_client_secret_...`
		- Đây là các **oauth client credentials** của bạn (không phải org id).
4. **Thêm URL Redirect**
	- Bạn có thể tìm thấy phần này trên tab "Overview".
	- Thêm `http://localhost:4180/oauth2/callback` cho thử nghiệm cục bộ.
	- Bạn phải thêm nó cụ thể vào trường **OAuth Redirect URI**, vì chúng ta đang sử dụng SAML-qua-OAuth.
	- URL redirect phải khớp **chính xác** với những gì bạn đã đặt trong OAuth2-Proxy (giao thức, host, cổng, đường dẫn).

### Thiết lập OAuth2-Proxy

[OAuth2-Proxy](https://github.com/oauth2-proxy/oauth2-proxy) cần được cấu hình cụ thể cho SSOReady. Chúng ta không thể sử dụng chế độ khám phá (discovery mode) OIDC, vì chúng ta cần thiết lập các URL tùy chỉnh cho tất cả các endpoint. May mắn thay, OAuth2-Proxy cho phép chúng ta tùy chỉnh mọi thứ, bao gồm bỏ qua discovery và chỉ định tất cả các URL OAuth một cách thủ công. Dưới đây là danh sách tất cả các [Tùy chọn Cấu hình OAuth2-Proxy](https://oauth2-proxy.github.io/oauth2-proxy/configuration/overview/#config-options) mà chúng ta cần đặt:

| Thuộc tính Cấu hình | Loại | Mô tả |
|-----------------|------|-------------|
| `provider` | String | Nhà cung cấp OIDC nào cần sử dụng. Đặt thuộc tính này thành `oidc` cho loại chung (generic), đó là những gì chúng ta muốn. |
| `client_id` | String | Client ID OAuth của SSOReady của bạn, mà bạn lấy từ trang "SAML OAuth Client". Trông giống như: `saml_oauth_client_********`. |
| `client_secret` | String | Client Secret OAuth của SSOReady của bạn, mà bạn lấy từ trang "SAML OAuth Client". Trông giống như: `ssoready_oauth_client_secret_********`. |
| `skip_oidc_discovery` | Boolean | Bỏ qua quy trình khám phá OIDC thông thường, vì chúng ta đang chỉ định cụ thể tất cả các URL riêng lẻ. Đặt thành `true`. |
| `login_url` | URL | URL đăng nhập tùy chỉnh cho SSOReady, đi kèm với ID Tổ chức. Đặt thành: `https://auth.ssoready.com/v1/oauth/authorize?organization_external_id=_ORG_`. Xem chi tiết bên dưới. |
| `redeem_url` | URL | Endpoint quy đổi token (token redemption endpoint). Đặt thành: `https://auth.ssoready.com/v1/oauth/token`. Đây là endpoint tùy chỉnh cho SSOReady. |
| `oidc_jwks_url` | URL | OIDC JWKS URI để xác thực token. Đặt thành: `https://auth.ssoready.com/v1/oauth/jwks`. Đây là thuộc tính bắt buộc cho SSOReady SAML. |
| `oidc_issuer_url` | URL | URL issuer OpenID Connect. Đối với SSOReady, thuộc tính này nên là `https://auth.ssoready.com/v1/oauth`. |
| `redirect_url` | URL | URL Redirect OAuth, cần khớp với những gì chúng ta đã thiết lập trong portal SSOReady: `http://localhost:4180/oauth2/callback`. |
| `scope` | String | Đặc tả scope OAuth. Danh sách này hoạt động cho SSOReady: `openid profile email`. |
| `oidc_email_claim` | String | OIDC claim nào chứa email của người dùng. Đối với hầu hết các SAML IdP, thuộc tính này nên được đặt thành `sub`. |
| `email_domains` | String | Thắt chặt phần này cho môi trường production thực tế, ví dụ: giới hạn chỉ đối với domain email của bạn, nhưng để thử nghiệm thì có thể đặt thành `*`. |
| `pass_user_headers` | Boolean | Chuyển tiếp các "trusted header" mà PTOps sử dụng để đăng nhập cho người dùng. Đặt thành `true`. |
| `set_authorization_header` | Boolean | Thiết lập response header `Authorization Bearer` (hữu ích trong chế độ auth_request của Nginx). Đặt thành `true`. |
| `skip_provider_button` | Boolean | Bỏ qua màn hình splash screen của OAuth2-Proxy, và thay vào đó đăng nhập ngay cho người dùng. Đặt thành `true`. |
| `cookie_secret` | Base64 | Tạo [cookie secret được mã hóa base64](https://oauth2-proxy.github.io/oauth2-proxy/configuration/overview/#generating-a-cookie-secret) của riêng bạn cho việc này. |
| `http_address` | IP:Port | Địa chỉ mạng và cổng để OAuth2-Proxy lắng nghe. Đặt thành: `0.0.0.0:4180`. |
| `upstreams` | URL | Nơi chuyển tiếp các yêu cầu sau khi xác thực. Để thử nghiệm, chúng ta sẽ sử dụng web server phản hồi [echo-server](https://hub.docker.com/r/ealen/echo-server), vì vậy hãy đặt thuộc tính này thành: `http://echo-server:80`. |
Lưu ý rằng tất cả các thuộc tính cấu hình này có thể được chỉ định dưới dạng các biến môi trường bằng cách chuyển đổi chúng thành chữ in hoa và thêm tiền tố `OAUTH2_PROXY_`, ví dụ: `OAUTH2_PROXY_PROVIDER`. Chúng tôi sẽ thực hiện việc này bên dưới trong thiết lập Docker Compose của mình.

**Tại sao chúng ta tắt tính năng tự động khám phá (discovery)**: OAuth2-Proxy không cho phép chúng ta thêm các tham số URL đăng nhập tùy ý, nhưng chúng ta cần đưa `?organization_external_id=_YOUR_ORG_ID_` vào cho SSOReady. Vì vậy, chúng ta sẽ tắt discovery và đặt các endpoint một cách rõ ràng, với tham số Org ID của chúng ta được truyền trong `login_url`. Cụ thể, đây là ID Tổ chức *bên ngoài* (external) SSOReady của bạn, thứ bạn nhập vào khi tạo tổ chức lần đầu. Ví dụ: `acme`.

**Tại sao chúng ta ánh xạ email claim**: OAuth2-Proxy cần một email để tạo session. Nếu email của ID token nằm trong `sub` (phổ biến với các nhà cung cấp SAML), hãy đặt `oidc_email_claim=sub` như được hiển thị. Tuy nhiên, điều này có thể khác đối với nhà cung cấp định danh SAML của bạn. Giá trị mặc định của cài đặt này trong OAuth2-Proxy là `email`, vì vậy hãy đảm bảo thử nghiệm điều đó nếu `sub` không hoạt động với bạn.

Xem mục [Thử nghiệm cục bộ với Echo Server](#thu-nghiem-cuc-bo-voi-echo-server) ở trên để chạy thử nghiệm cục bộ OAuth2-Proxy bằng cách sử dụng web server phản hồi [echo-server](https://hub.docker.com/r/ealen/echo-server), để thử nghiệm mọi thứ trước khi bạn tích hợp PTOps.

Khi mọi thứ hoạt động bình thường, xem phần [Cấu hình](#cau-hinh) ở trên để cấu hình PTOps cho SSO.

## Active Directory

Nếu công ty của bạn không có nhà cung cấp định danh OIDC hoặc SAML, nhưng có một server [LDAP](https://en.wikipedia.org/wiki/Lightweight_Directory_Access_Protocol) hoặc [Active Directory](https://en.wikipedia.org/wiki/Active_Directory), bạn có thể sử dụng [Authelia](https://www.authelia.com/) thay cho OAuth2-Proxy. Authelia hoạt động theo cách tương tự như OAuth2-Proxy, nhưng hỗ trợ LDAP hoặc AD như một nhà cung cấp xác thực người dùng upstream. Nó cũng miễn phí và nguồn mở, và có thể chuyển tiếp các trusted header tới PTOps. Xem các hướng dẫn sau để được hỗ trợ trong việc thiết lập này:

- [Authelia LDAP Setup](https://www.authelia.com/configuration/first-factor/ldap/)
- [Authelia Active Directory Setup](https://www.authelia.com/integration/ldap/activedirectory/)
- [Authelia SSO Trusted Headers](https://www.authelia.com/integration/trusted-header-sso/introduction/)

[Ánh xạ Header](#anh-xa-header-header-map) của PTOps nên được đặt như sau:

```json
"header_map": {
	"username": "remote-user",
	"full_name": "remote-name",
	"email": "remote-email",
	"groups": "remote-groups"
}
```

Authelia cũng có thể được [tích hợp với Nginx](https://www.authelia.com/integration/proxies/nginx/) để giải mã TLS.

## Tailscale

Xem [Hướng dẫn Tailscale](tailscale.md) chuyên dụng của chúng tôi để thiết lập PTOps với Tailscale.

## Lệnh tùy chỉnh (Custom Command)

Hệ thống con SSO có thể tùy chọn khởi chạy một lệnh shell tùy chỉnh để lọc và chuyển đổi các yêu cầu gửi đến. Ý tưởng là lệnh đó có thể đọc yêu cầu và xây dựng các header thích hợp để bắt đầu quy trình SSO. Các header mới do lệnh phát ra sẽ được chèn ngược lại vào yêu cầu khi nó được gửi qua đăng nhập SSO. Tính năng này dành cho các tích hợp phức tạp, nơi một [bản đồ ánh xạ header](#anh-xa-header-header-map) đơn giản không đủ đáp ứng, và các logic bổ sung cần được thực hiện. Bản thân lệnh này nên được đặt vào đối tượng [cấu hình SSO](#cau-hinh) dưới dạng một thuộc tính có tên là `command`. Ví dụ:

```json
"command": "npx -y @pixlcore/xyplug-sso-aws-alb@1.0.0"
```

Ví dụ này sử dụng [Plugin AWS ALB SSO cho PTOps](https://github.com/pixlcore/xyplug-sso-aws-alb).

Tương tự như các loại Plugin PTOps khác, việc giao tiếp với lệnh tuân theo [Giao thức Dây truyền tin PTOps (Wire Protocol)](xywp.md). Siêu dữ liệu yêu cầu (request metadata) được gửi đến tiến trình lệnh thông qua JSON qua STDIN, và tiến trình này dự kiến sẽ phát ra JSON qua STDOUT. Xem chi tiết bên dưới.

### Đầu vào của Lệnh

Khi lệnh tùy chỉnh SSO được gọi, nó được truyền một tài liệu JSON trên STDIN (được nén thành một dòng duy nhất). Nội dung này nên chứa mọi thứ cần thiết để xác thực yêu cầu và xây dựng các header thích hợp cho đăng nhập SSO. Các thuộc tính cấp cao nhất sau đây sẽ xuất hiện trong đối tượng:

| Tên Thuộc tính | Loại | Mô tả |
|---------------|------|-------------|
| `xy` | Number | Cho biết phiên bản [Giao thức Dây truyền tin PTOps](xywp.md). Sẽ được đặt thành `1`. |
| `type` | String | Cho biết loại hành động, sẽ được đặt thành `sso`. |
| `config` | Object | Toàn bộ object [Cấu hình SSO](#cau-hinh) được bao gồm để lệnh sử dụng. |
| `base_app_url` | String | Thuộc tính [base_app_url](config.md#base_app_url) từ cấu hình PTOps hiện tại. |
| `method` | String | Phương thức yêu cầu, luôn luôn là `GET`. |
| `url` | String | Đường dẫn URI yêu cầu, luôn luôn là `/`. |
| `headers` | Object | Object header yêu cầu (tất cả các tên header đều được chuyển thành chữ thường). |
| `cookies` | Object | Bất kỳ cookie nào được tìm thấy trong header `Cookie` đều được phân tích cú pháp và đặt vào object này. |
| `query` | Object | Query string của URL, được phân tích cú pháp thành một object. |
| `id` | String | Một ID nội bộ cho yêu cầu, được sử dụng để ghi log. |
| `ip` | String | Địa chỉ IP "công khai" của yêu cầu (dự đoán tốt nhất). Xem [args.ip](https://github.com/jhuckaby/pixl-server-web#argsip). |
| `ips` | Array | Tất cả các IP của yêu cầu, bao gồm cả các IP proxy được chuyển tiếp. Xem [args.ips](https://github.com/jhuckaby/pixl-server-web#argsips). |

Dưới đây là một ví dụ về tài liệu JSON được gửi đến STDIN của lệnh SSO (được in đẹp để hiển thị):

```json
{
	"xy": 1,
	"type": "sso",
	"config": {
		/* Toàn bộ nội dung cấu hình sso.json ở đây */
	},
	"base_app_url": "https://local.xyops.io:5523",
	"method": "GET",
	"url": "/",
	"headers": {
		"host": "local.xyops.io:5523",
		"connection": "keep-alive",
		"sec-ch-ua": "\"Chromium\";v=\"146\", \"Not-A.Brand\";v=\"24\", \"Google Chrome\";v=\"146\"",
		"sec-ch-ua-mobile": "?0",
		"sec-ch-ua-platform": "\"macOS\"",
		"upgrade-insecure-requests": "1",
		"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
		"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
		"sec-fetch-site": "none",
		"sec-fetch-mode": "navigate",
		"sec-fetch-user": "?1",
		"sec-fetch-dest": "document",
		"accept-encoding": "gzip, deflate, br, zstd",
		"accept-language": "en-US,en;q=0.9",
		"x-amzn-oidc-identity": "jhuckaby",
		"x-amzn-oidc-data": "BfAmkJ8BxEIeI4NVu4qpZn6usqkx8J5WKZvSikTS87ImJDhacUsV3wCPmS5RC58n8JDTwrx-90ns_FefwQRCQM",
		"ssl": 1,
		"https": 1
	},
	"cookies": {},
	"query": {},
	"id": "r2",
	"ip": "127.0.0.1",
	"ips": [
		"127.0.0.1"
	]
}
```

### Đầu ra của Lệnh

Sau khi lệnh tùy chỉnh của bạn xác thực và xử lý yêu cầu, nó cần gửi kết quả đầu ra ngược lại cho PTOps. Việc này được thực hiện bằng cách in một tài liệu JSON ra STDOUT. Nó nên được nén trên một dòng duy nhất, và chứa các thuộc tính cấp cao nhất sau đây:

| Tên Thuộc tính | Loại | Mô tả |
|---------------|------|-------------|
| `xy` | Number | Cho biết phiên bản [Giao thức Dây truyền tin PTOps](xywp.md). Giá trị này phải được đặt thành `1`. |
| `code` | Number | Số không (`0`) biểu thị thành công, bất kỳ giá trị nào khác là lỗi. |
| `description` | String | Thông báo lỗi tùy chọn, sẽ hiển thị cho người dùng nếu `code` khác không. |
| `headers` | Object | Các header mới để chèn vào yêu cầu cho đăng nhập SSO. |
| `redirect` | Boolean | Tùy chọn chuyển hướng người dùng đến một URL (cũng nên bao gồm `headers.location`). |

Dưới đây là một ví dụ output (được in đẹp để hiển thị):

```json
{
	"xy": 1,
	"code": 0,
	"headers": {
		"x-forwarded-user": "jhuckaby",
		"x-forwarded-name": "Joseph Huckaby",
		"x-forwarded-email": "jhuckaby@example.com",
		"x-forwarded-groups": "pixlcore:owners"
	}
}
```

Ý tưởng ở đây là lệnh xác thực và phân tích cú pháp yêu cầu, sử dụng bất kỳ mẩu thông tin nào được yêu cầu. Trong ví dụ trên, đó là hai header này chứa thông tin người dùng được mã hóa:

```
"x-amzn-oidc-identity": "jhuckaby",
"x-amzn-oidc-data": "BfAmkJ8BxEIeI4NVu4qpZn6usqkx8J5WKZvSikTS87ImJDhacUsV3wCPmS5RC58n8JDTwrx-90ns_FefwQRCQM",
```

Sau khi giải mã dữ liệu, lệnh sau đó tạo ra các trusted header được định dạng chính xác (khớp với [Ánh xạ Header](#anh-xa-header-header-map)) để bắt đầu quy trình đăng nhập SSO:

```
"x-forwarded-user": "jhuckaby",
"x-forwarded-name": "Joseph Huckaby",
"x-forwarded-email": "jhuckaby@example.com",
"x-forwarded-groups": "pixlcore:owners"
```

Nếu xảy ra sự cố và yêu cầu không thể được xác thực, lệnh của bạn sẽ gửi lại một mã `code` khác không cùng với một mô tả `description` vốn sẽ được ghi lại và hiển thị cho người dùng. Ví dụ:

```json
{
	"xy": 1,
	"code": 1,
	"description": "Failed to validate request: Missing x-amzn-oidc-identity header"
}
```

Nếu bạn cần chuyển hướng người dùng đến một URL tùy chỉnh, hãy đặt `redirect` thành true và bao gồm một header `location`. Ví dụ:

```json
{
	"xy": 1,
	"code": 0,
	"redirect": true,
	"headers": {
		"location": "https://custom/url/here"
	}
}
```

### Gỡ lỗi cho Lệnh (Command Debugging)

Để gỡ lỗi các lệnh tùy chỉnh, hãy đặt [debug_level](config.md#debug_level) của bạn thành `9`, và theo dõi log `logs/SSO.log`. Nó sẽ chứa đầy đủ yêu cầu và phản hồi của lệnh, bao gồm cả STDOUT và STDERR thô.

## Môi trường Production

Trong môi trường production, điều quan trọng là phải đảm bảo tính bảo mật và độ tin cậy của việc triển khai SSO. Dưới đây là một checklist:

1. **Sử dụng HTTPS ở mọi nơi**: Luôn sử dụng HTTPS để mã hóa thông tin liên lạc giữa client và server, cũng như giữa server và nhà cung cấp định danh.
2. **Giám sát và Kiểm tra**: Liên tục giám sát và kiểm tra việc triển khai SSO để phát hiện bất kỳ hoạt động đáng ngờ nào hoặc các vi phạm bảo mật tiềm ẩn.
3. **Cập nhật Phần mềm**: Thường xuyên cập nhật PTOps, bao gồm các thư viện xác thực và framework, để đảm bảo rằng mọi lỗ hổng bảo mật đều được vá.
4. **Bảo vệ Secret**: Giữ bí mật cho các client secret, state secret, cookie secret và các log debug SSO.
5. **Whitelist các IP tin cậy**: Đối với các thiết lập dựa trên proxy, hãy sử dụng whitelist IP để giới hạn nguồn của các trusted header (xem bên dưới).
6. **Chỉ dùng Cookie Bảo mật**: Đối với OAuth2-Proxy, hãy nhớ đặt `OAUTH2_PROXY_COOKIE_SECURE` thành `true` cho môi trường production thực tế.
7. **Giới hạn Domain Email**: Đối với OAuth2-Proxy, đặt `OAUTH2_PROXY_EMAIL_DOMAINS` để giới hạn danh sách domain email đăng nhập của bạn.
8. **Base App URL của PTOps**: Hãy nhớ đặt thuộc tính cấu hình [base_app_url](config.md#base_app_url) cho thiết lập production thực tế của bạn.
9. **Sử dụng nhiều Availability Zone**: Để chạy nhiều server conductor PTOps, lý tưởng nhất là đặt chúng trong các AZ riêng biệt.

### Whitelist IP

Đối với SSO dựa trên proxy, điều quan trọng là phải cấu hình PTOps để nó **chỉ** chấp nhận các trusted header từ server proxy xác thực của bạn, và *không nhận từ bất kỳ nơi nào khác*. Để làm điều này, hãy thêm thuộc tính IP `whitelist` trong cấu hình SSO của PTOps. Đây phải là một mảng các địa chỉ hoặc dải địa chỉ IPv4 và/hoặc IPv6, bao gồm các IP đơn, IP một phần và/hoặc các [khối CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing).

Đối với SSO dựa trên lệnh như [Plugin OIDC PTOps](#plugin-oidc-ptops), không có IP proxy tin cậy riêng biệt, do đó `whitelist` thường được đặt thành `false`.

File [sso.json](https://github.com/pixlcore/xyops/sample_conf/sso.json) mẫu của chúng tôi đi kèm với một whitelist mặc định bao gồm tất cả các dải địa chỉ riêng tư [IPv4](https://en.wikipedia.org/wiki/Private_network#Private_IPv4_addresses) và [IPv6](https://en.wikipedia.org/wiki/Private_network#Private_IPv6_addresses), bao gồm cả các địa chỉ [localhost loopback](https://en.wikipedia.org/wiki/Localhost#Loopback) (cả phiên bản IPv4 và IPv6) và [địa chỉ link-local](https://en.wikipedia.org/wiki/Link-local_address) (cả phiên bản IPv4 và IPv6). Nó sử dụng tập hợp các [khối CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing) sau đây:

```json
"whitelist": ["127.0.0.1", "10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16", "::1/128", "fd00::/8", "169.254.0.0/16", "fe80::/10"]
```

Thiết lập này sẽ hoạt động tốt trong hầu hết các trường hợp, nhưng bạn có thể khóa nó chặt hơn nữa, để **chỉ** chấp nhận các trusted header từ đúng server proxy xác thực cụ thể của bạn. Ví dụ, nếu bạn đang chạy PTOps và proxy xác thực trên cùng một server, bạn có thể khóa hoàn toàn để chỉ chấp nhận các trusted header từ localhost:

```json
"whitelist": ["127.0.0.1", "::1/128"]
```
