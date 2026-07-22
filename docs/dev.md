# Phát Triển

## Tổng Quan

PTOps chạy như một thành phần trong framework [pixl-server](https://github.com/jhuckaby/pixl-server). Rất nên đọc và hiểu module này cùng hệ thống component của nó trước khi bắt tay vào phát triển PTOps. Các component server sau đây cũng được sử dụng:

| Tên Module | Mô Tả | License |
|-------------|-------------|---------|
| [pixl-server-api](https://github.com/jhuckaby/pixl-server-api) | Component REST API cho framework pixl-server. | MIT |
| [pixl-server-debug](https://github.com/jhuckaby/pixl-server-debug) | Cách dễ dàng để debug app pixl-server bằng Chrome Dev Tools. | MIT |
| [pixl-server-storage](https://github.com/jhuckaby/pixl-server-storage) | Component lưu trữ key/value/list cho framework pixl-server. | MIT |
| [pixl-server-user](https://github.com/jhuckaby/pixl-server-user) | Hệ thống đăng nhập người dùng cơ bản cho framework pixl-server. | MIT |
| [pixl-server-web](https://github.com/jhuckaby/pixl-server-web) | Component web server cho framework pixl-server. | MIT |
| [pixl-server-unbase](https://github.com/jhuckaby/pixl-server-unbase) | Component database cho framework pixl-server. | MIT |

Ngoài ra, PTOps sử dụng các module tiện ích PixlCore phía server sau:

| Tên Module | Mô Tả | License |
|-------------|-------------|---------|
| [pixl-acl](https://github.com/jhuckaby/pixl-acl) | Một cách triển khai đơn giản nhưng nhanh cho lọc ACL IPv4 và IPv6. | MIT |
| [pixl-args](https://github.com/jhuckaby/pixl-args) | Module đơn giản để parse tham số dòng lệnh. | MIT |
| [pixl-boot](https://github.com/jhuckaby/pixl-boot) | Đăng ký dịch vụ của bạn để khởi chạy khi server bật (Linux / macOS). | MIT |
| [pixl-chart](https://github.com/jhuckaby/pixl-chart) | Một renderer biểu đồ chuỗi thời gian đơn giản dùng HTML5 Canvas. | MIT |
| [pixl-class-util](https://github.com/pixlcore/class-util) | Các hàm hỗ trợ để mở rộng class bằng mixin và hơn thế nữa. | MIT |
| [pixl-cli](https://github.com/jhuckaby/pixl-cli) | Công cụ để xây dựng app dòng lệnh cho Node.js. | MIT |
| [pixl-config](https://github.com/jhuckaby/pixl-config) | Bộ tải cấu hình JSON đơn giản. | MIT |
| [pixl-json-stream](https://github.com/jhuckaby/pixl-json-stream) | Cung cấp API dễ dùng để gửi và nhận các record JSON qua standard stream (pipe hoặc socket). | MIT |
| [pixl-logger](https://github.com/jhuckaby/pixl-logger) | Class logging đơn giản tạo ra các cột log dạng ngăn cách bằng dấu ngoặc. | MIT |
| [pixl-mail](https://github.com/jhuckaby/pixl-mail) | Class rất đơn giản để gửi email qua SMTP. | MIT |
| [pixl-perf](https://github.com/jhuckaby/pixl-perf) | Hệ thống theo dõi hiệu năng đơn giản, độ chính xác cao. | MIT |
| [pixl-request](https://github.com/jhuckaby/pixl-request) | Module rất đơn giản để thực hiện HTTP request. | MIT |
| [pixl-tools](https://github.com/jhuckaby/pixl-tools) | Bộ các hàm tiện ích linh tinh cho Node.js. | MIT |
| [pixl-unit](https://github.com/jhuckaby/pixl-unit) | Bộ chạy unit test rất đơn giản cho Node.js. | MIT |

Về phía client, ứng dụng web PTOps được xây dựng trên framework HTML5/CSS/JavaScript [pixl-xyapp](https://github.com/pixlcore/pixl-xyapp):

| Tên Module | Mô Tả | License |
|-------------|-------------|---------|
| [pixl-xyapp](https://github.com/pixlcore/pixl-xyapp) | Framework JavaScript phía client, được thiết kế làm nền tảng cho ứng dụng web. | MIT |

## Cài Đặt Công Cụ Dev

PTOps chứa một số dependency nhị phân được biên dịch sẵn (cụ thể là [better-sqlite3](https://npmjs.com/package/better-sqlite3)), nên nếu không tìm thấy binary biên dịch sẵn cho đúng kiến trúc (arch) của bạn, nó có thể cần được biên dịch từ source. Để làm điều đó, bạn có thể cần:

Với hệ điều hành Debian (Ubuntu):

```sh
apt-get install build-essential python3-setuptools
```

Với RedHat (Fedora / CentOS):

```sh
yum install gcc-c++ make
```

Với macOS, tải [Apple's Xcode](https://developer.apple.com/xcode/download/), sau đó cài [command-line tools](https://developer.apple.com/downloads/).

## Cài Đặt Thủ Công

Đây là cách bạn có thể tải bản dev build mới nhất của PTOps và cài đặt thủ công (có thể chứa bug!):

```sh
git clone https://github.com/pixlcore/xyops.git
cd xyops
npm install
node bin/build.js dev
```

Truyền `dev` vào build script nghĩa là nó sẽ giữ toàn bộ JS và CSS không bị obfuscate (source gốc được phục vụ dưới dạng các file riêng biệt).

Mình khuyến nghị mạnh mẽ nên đặt file `.gitignore` sau ở gốc project, nếu bạn định commit thay đổi và gửi pull request:

```
.gitignore
/node_modules
/work
/logs
/data
/conf
/temp
htdocs/index.html
htdocs/test*
htdocs/js/external/*
htdocs/js/common
htdocs/fonts/*
htdocs/css/font*
htdocs/css/mat*
htdocs/css/base.css
htdocs/css/normalize.css
htdocs/css/atom*
htdocs/css/xterm*
htdocs/codemirror
sample_conf/masters.json
```

## Khởi Chạy Ở Chế Độ Debug

Để khởi chạy PTOps ở chế độ debug, thực hiện lệnh sau:

```
./bin/debug.sh
```

Lệnh này sẽ khởi chạy dịch vụ mà không fork ra một daemon process, và echo toàn bộ nội dung debug log ra console. Rất hữu ích để debug các vấn đề phía server. Cẩn thận với quyền file nếu bạn chạy với user không phải root. Nhấn Ctrl-C hai lần để tắt dịch vụ khi ở chế độ này.

Ngoài ra, bạn có thể tuỳ chỉnh những category log nào được echo ra bằng cách chỉ định một danh sách ngăn cách bởi khoảng trắng, dưới dạng một CLI argument duy nhất, như sau:

```sh
./bin/debug.sh "PTOps Transaction Error API Unbase Action Comm Job Workflow Maint Multi Scheduler SSO"
```

Điều này hữu ích để tắt tiếng các component quá ồn ào như `Storage` và `WebServer`.

## REPL

Theo mặc định, script `debug.sh` của PTOps khởi chạy một [REPL](https://nodejs.org/api/repl.html) trong console, để bạn có thể nhập JavaScript sống và thực thi nó trong process PTOps. Bạn cũng có quyền truy cập các biến global sau:

| Global | Mô Tả |
|--------|-------------|
| `server` | Instance [pixl-server](https://github.com/jhuckaby/pixl-server) toàn cục hiện tại. |
| `cli` | Global [pixl-cli](https://github.com/jhuckaby/pixl-cli), chứa nhiều hàm tiện ích khác nhau. |
| `PTOps` | Component server chính của PTOps. Cũng có alias là `xy`. |
| `Storage` | Component server [pixl-server-storage](https://github.com/jhuckaby/pixl-server-storage). |
| `Unbase` | Component server [pixl-server-unbase](https://github.com/jhuckaby/pixl-server-unbase). |
| `WebServer` | Component server [pixl-server-web](https://github.com/jhuckaby/pixl-server-web). |
| `API` | Component server [pixl-server-api](https://github.com/jhuckaby/pixl-server-api). |
| `User` | Component server [pixl-server-user](https://github.com/jhuckaby/pixl-server-user). |
| `Debug` | Component server [pixl-server-debug](https://github.com/jhuckaby/pixl-server-debug). |

Bạn cũng có quyền truy cập các lệnh REPL sau (dùng dấu chấm ở đầu để kích hoạt):

| Lệnh | Mô Tả |
|---------|-------------|
| `.echo` | Thêm hoặc xoá category echo, ví dụ `.echo add Storage WebServer`. |
| `.notify` | Gửi thông báo cho tất cả người dùng, ví dụ `.notify HI THERE`. Kèm hiệu ứng âm thanh ngẫu nhiên! |

## Chạy Unit Test

PTOps đi kèm một bộ unit test đầy đủ, chạy qua module [pixl-unit](https://github.com/jhuckaby/pixl-unit) (sẽ được tự động cài đặt). Để chạy unit test, đảm bảo PTOps chưa chạy sẵn, và nhập:

```
npm test
```

Nếu có test nào fail, hãy mở [GitHub Issue](https://github.com/pixlcore/xyops/issues) và kèm theo log unit test liên quan, có thể tìm thấy tại `./test/logs/`.

## Chứng Chỉ Tự Ký (Self-Signed)

Đây là cách tạo một chứng chỉ TLS tự ký và được tin cậy, bạn có thể dùng với PTOps để phát triển cục bộ. Đầu tiên, tạo file config tạm (`san.cnf`):

```
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
x509_extensions = v3_req

[dn]
CN = localhost

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
```

Sau đó chạy lệnh này:

```sh
openssl req -x509 -newkey rsa:2048 -nodes -keyout tls.key -out tls.crt -days 365 -config san.cnf
```

Sau đó, làm theo hướng dẫn dưới đây cho platform phát triển của bạn.

### Tin Cậy Chứng Chỉ Trên Windows

1. Nhấn Windows + R, gõ `certmgr.msc`, và nhấn Enter.
2. Ở panel bên trái, mở rộng: **Trusted Root Certification Authorities** → **Certificates**.
3. Nhấn phải vào **Certificates**, sau đó chọn: **All Tasks → Import...**
4. Duyệt tới file `tls.crt` của bạn.
5. Chọn "Place all certificates in the following store" → đảm bảo nó được đặt là **Trusted Root Certification Authorities**.
6. Hoàn tất và xác nhận bất kỳ cảnh báo bảo mật nào.

### Tin Cậy Chứng Chỉ Trên macOS

1. Mở app **Keychain Access**.
2. Ở sidebar bên trái, chọn **System** trong **Keychains**.
3. Chọn **Certificates** trong **Category**.
4. Từ menu trên cùng, chọn **File → Import Items...**
5. Chọn file `tls.crt` của bạn, xác nhận import vào keychain System.
6. Bạn sẽ được yêu cầu nhập mật khẩu macOS để cho phép thay đổi.
7. Sau khi import, double-click vào entry chứng chỉ.
8. Trong popup, mở rộng phần **Trust**.
9. Đặt "When using this certificate" thành **Always Trust**.
10. Đóng cửa sổ, và nhập lại mật khẩu nếu được yêu cầu.

### Tin Cậy Chứng Chỉ Trên Linux

**Debian/Ubuntu:**

1. `sudo cp tls.crt /usr/local/share/ca-certificates/xyops.crt`
2. `sudo update-ca-certificates`

**RedHat/CentOS/Fedora:**

1. `sudo cp tls.crt /etc/pki/ca-trust/source/anchors/xyops.crt`
2. `sudo update-ca-trust extract`

**Lưu ý:** Điều này không ảnh hưởng đến Firefox trừ khi nó được cấu hình để dùng system trust (theo mặc định nó có CA store riêng).

### Chuyển Vào PTOps

Chuyển các file cert vào vị trí này để PTOps sử dụng:

```sh
mv tls.crt /opt/xyops/conf/
mv tls.key /opt/xyops/conf/
```

Bây giờ bạn có thể xoá file `san.cnf`. Nó chỉ được dùng tạm thời trong quá trình tạo cert.
