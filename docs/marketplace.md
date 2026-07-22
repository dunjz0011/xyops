# Plugin Marketplace

## Tổng Quan

PTOps có Plugin Marketplace tích hợp, giúp bạn mở rộng tính năng của app bằng cách sử dụng các Plugin do PixlCore (nhà sản xuất PTOps) xuất bản, cũng như từ cộng đồng developer. Để truy cập marketplace, nhấn vào liên kết "**Marketplace**" ở sidebar.

Tài liệu này giải thích cách tạo và xuất bản Plugin PTOps của riêng bạn. Marketplace Plugin thực chất là các thư viện code được host trên cloud, tự tải xuống và tự thực thi, kèm metadata để hiển thị trong marketplace, và định nghĩa các parameter của Plugin để cấu hình.

Marketplace thực ra không "host" Plugin -- nó chỉ cung cấp cơ chế tìm kiếm để phát hiện chúng. Các Plugin thực sự được host trên các package repository như NPM, PyPI hoặc GitHub, và marketplace liên kết trực tiếp đến chúng.

> [!NOTE]
> Với marketplace v1, repository mã nguồn của bạn phải được host trên GitHub. Chúng tôi sẽ mở rộng hỗ trợ các host khác như GitLab và BitBucket trong tương lai.

## Yêu Cầu

Để xuất bản Plugin PTOps của bạn lên marketplace, nó phải:

- Miễn phí sử dụng
	- Plugin có thể cần truy cập dịch vụ trả phí của bên thứ ba, điều đó không sao.
	- "Miễn phí" ở đây nghĩa là việc cài đặt Plugin không tốn tiền (marketplace của chúng tôi không có nút "mua").
- Được host công khai trên GitHub.
	- Chúng tôi sẽ mở rộng hỗ trợ các host khác trong tương lai.
- Có thể thực thi bằng một lệnh combo tải xuống + khởi chạy tự chứa.
	- Ví dụ như [npx](https://docs.npmjs.com/cli/commands/npx), [uvx](https://docs.astral.sh/uv/guides/tools/), [go run](https://pkg.go.dev/cmd/go#hdr-Compile_and_run_Go_program), và [docker run](https://docs.docker.com/reference/cli/docker/container/run/).
	- Lệnh phải tải xuống một phiên bản gắn tag cụ thể hoặc commit hash của Plugin.
- Hoàn toàn mã nguồn mở, dùng [license được OSI công nhận](https://opensource.org/licenses).
	- Tất cả dependency của Plugin cũng phải tuân theo yêu cầu này.
- Khai báo mọi hoạt động thu thập dữ liệu người dùng hoặc metric.
	- Nếu Plugin thu thập dữ liệu người dùng vì bất kỳ lý do gì, điều này phải được khai báo trong [README](#readme).
	- Ngoại lệ là khi dịch vụ bên thứ ba tự thu thập dữ liệu của họ, nằm ngoài kiểm soát của tác giả.
- Hoàn toàn hợp pháp khi sử dụng.
	- Plugin không được vi phạm bất kỳ luật pháp hoặc điều khoản dịch vụ nào, trực tiếp hay gián tiếp.
- Phù hợp với gia đình (family friendly).
	- Không nội dung người lớn, ngôn ngữ tục tĩu, v.v.

PixlCore có quyền từ chối bất kỳ Plugin nào mà họ cho là không phù hợp với marketplace.

## Lệnh Khởi Chạy

Plugin của bạn cần có khả năng tự tải xuống và tự khởi chạy bằng một lệnh shell combo. Các lệnh này thường tải phần mềm vào một thư mục cache tạm thời, cài đặt tất cả dependency, và khởi chạy Plugin của bạn trong một bước. Ví dụ các lệnh này bao gồm:

- [npx](https://docs.npmjs.com/cli/commands/npx) - Nếu Plugin của bạn viết bằng Node.js, đây là lệnh hoàn hảo để dùng.
- [uvx](https://docs.astral.sh/uv/guides/tools/) - Nếu Plugin của bạn viết bằng Python, `uvx` chắc chắn là công cụ dành cho bạn.
- [go run](https://pkg.go.dev/cmd/go#hdr-Compile_and_run_Go_program) - Nếu Plugin của bạn viết bằng Go, dùng `go run` để tải xuống và chạy Plugin của bạn bằng một lệnh duy nhất.
- [docker run](https://docs.docker.com/reference/cli/docker/container/run/) - Nếu Plugin của bạn được đóng gói dưới dạng docker container trên một container registry công khai, dùng `docker run`.

Ngoài ra, bạn có thể đóng gói Plugin với một script "inline", nghĩa là nó sẽ chạy trực tiếp mà không cần wrapper combo. Xem [Inline](#inline) bên dưới để biết chi tiết.

### npx

Đây là ví dụ lệnh dùng `npx`. Cờ `-y` bỏ qua prompt xác nhận của người dùng.

```sh
npx -y @myorg/xyplug-example@1.0.0
```

Lệnh này sẽ tải xuống, cài đặt và chạy phiên bản `1.0.0` của module `xyplug-example` từ org `myorg` trên NPM.

Module của bạn không cần thực sự được xuất bản lên package registry của NPM. Nó có thể chỉ đơn giản nằm trên GitHub, GitLab, hoặc BitBucket, và có một tag phiên bản. Ví dụ (GitHub):

```sh
npx -y github:myorg/xyplug-example#v1.0.0
```

Biến thể này dùng `npx` với một liên kết repo GitHub, và tag phiên bản inline (`#v1.0.0`). Lưu ý rằng trong trường hợp này người dùng cũng cần CLI `git`, vì đó là cách NPX resolve các liên kết package dạng này. Vì vậy bạn cần liệt kê `git` là một yêu cầu bổ sung của Plugin (xem [Yêu Cầu Plugin](#requirements)).

Để tìm hiểu thêm về cách đóng gói project Node.js của bạn cho NPX, và xem demo hoạt động trực tiếp, hãy xem [xyplug-sample-npx](https://github.com/pixlcore/xyplug-sample-npx) trên GitHub.

### uvx

Đây là ví dụ lệnh dùng `uvx`:

```sh
uvx git+https://github.com/myorg/xyplug-example@v1.0.0
```

Để tìm hiểu thêm về cách đóng gói project Python của bạn cho UVX, và xem demo hoạt động trực tiếp, hãy xem [xyplug-sample-uvx](https://github.com/pixlcore/xyplug-sample-uvx) trên GitHub.

### go run

Đây là ví dụ lệnh dùng `go run`:

```sh
go run github.com/myorg/xyplug-example@v1.0.0
```

Để tìm hiểu thêm về cách đóng gói project Go của bạn cho `go run`, và xem demo hoạt động trực tiếp, hãy xem [xyplug-sample-go](https://github.com/pixlcore/xyplug-sample-go) trên GitHub.

### docker run

Đây là ví dụ dùng `docker run`:

```sh
docker run --rm -i REGISTRY/OWNER/IMAGE:TAG
```

Đây là ví dụ về một image tưởng tượng trên GitHub Container Registry:

```sh
docker run --rm -i ghcr.io/myorg/xyplug-example:1.0.0
```

Cờ `--rm` làm container ephemeral (tự xoá sau khi chạy), và cờ `-i` bật STDIN để truyền vào entrypoint bên trong container.

### Inline

Bạn có thể tuỳ chọn đóng gói Plugin của mình dưới dạng script inline, không cần wrapper CLI cài đặt. Trong trường hợp này bạn chỉ định lệnh khởi chạy cho runtime ngôn ngữ của mình (ví dụ `node`, `python`, `go`, `bash`, v.v.), và bao gồm toàn bộ source script trong thuộc tính `script`. Ví dụ:

```json
"command": "node",
"script": "console.log(JSON.stringify({ xy:1, code:0 }));"
```

Phương pháp này chỉ hoạt động khi script của bạn đóng gói dưới dạng một file độc lập, và không có dependency nào ngoài chính runtime ngôn ngữ.

## Xuất Dữ Liệu Plugin

Trên màn hình chỉnh sửa Plugin, PTOps cung cấp nút "**Export...**". Nhấn vào đây để tải Plugin của bạn dưới dạng [PTOps Portable Data](xypdf.md). Đây là ví dụ export:

```json
{
	"type": "xypdf",
	"version": "1.0",
	"xyops": "0.9.0",
	"description": "PTOps Portable Data",
	"items": [
		{
			"type": "plugin",
			"data": {
				"id": "pmb6q7bh3hy",
				"title": "Upload S3 File",
				"type": "event",
				"enabled": true,
				"command": "npx -y github:myorg/xyplug-upload-s3-file#v1.0.0",
				"script": "",
				"icon": "aws",
				"notes": "Upload a local file to an S3 bucket.",
				"params": [
					{
						"id": "region",
						"title": "Region ID",
						"type": "text",
						"required": true
					},
					{
						"id": "bucket",
						"title": "Bucket Name",
						"type": "text",
						"required": true
					},
					{
						"id": "localPath",
						"title": "Local Path",
						"type": "text",
						"value": ""
					},
					{
						"id": "remotePath",
						"title": "Remote Path",
						"type": "text",
						"value": ""
					}
				]
			}
		}
	]
}
```

Commit file này vào repository mã nguồn của Plugin. Nó phải nằm ở cấp gốc (root) và được đặt tên `xyops.json`.

## README

Đảm bảo Plugin của bạn có file `README.md` chi tiết ở cấp gốc của repository. Nó phải ở dạng [Markdown](https://daringfireball.net/projects/markdown/syntax), cụ thể là [GitHub-Flavored Markdown](https://github.github.com/gfm/). File này sẽ đóng vai trò là trang chi tiết sản phẩm khi người dùng nhấn vào Plugin của bạn từ kết quả tìm kiếm marketplace. README của bạn nên có:

- Mô tả chi tiết bằng tiếng Anh về việc Plugin của bạn làm gì.
	- Các locale không phải tiếng Anh sẽ được giới thiệu sớm.
- Danh sách các yêu cầu CLI cần thiết để cài đặt Plugin.
	- ví dụ `npx`, `git`, `uvx`, `go`, và/hoặc `docker`.
- Danh sách tất cả biến môi trường mà Plugin của bạn cần.
	- ví dụ API key, auth token, secret, v.v.
- Khai báo mọi hoạt động thu thập dữ liệu người dùng hoặc metric.
- Ví dụ sử dụng (khuyến khích, không bắt buộc).

## Logo

Plugin của bạn nên có một hình logo, để hiển thị trong kết quả tìm kiếm marketplace. Nó nên:

- Tỷ lệ khung hình 1:1 (vuông)
- Trong suốt alpha và thân thiện với chế độ sáng/tối
- Kích thước tối thiểu 128x128px
- Định dạng PNG
- Đặt tên `logo.png`
- Lưu ở cấp gốc của repo

## License

Đảm bảo Plugin của bạn có file `LICENSE.md` (hoặc `LICENSE`) ở cấp gốc của repository mã nguồn.

Lưu ý nó phải là [license được OSI công nhận](https://spdx.org/licenses/) để đủ điều kiện đưa vào marketplace.

## Các File

Tổng hợp lại, các file sau cần nằm ở cấp gốc của git repo:

```
README.md
LICENSE.md
xyops.json
logo.png
```

(License có thể được đặt tên khác là `LICENSE` hoặc `COPYING`, có hoặc không có phần mở rộng.)

## Tags

Đảm bảo bạn gắn tag cho repo với mỗi lần release. Tên git tag nên là số phiên bản, thường có ký tự `v` ở đầu, theo sau là số phiên bản 3 phần. Ví dụ:

```
v1.0.0
v1.0.1
v2.0.0
```

Nên dùng cách đánh phiên bản theo kiểu [semver](https://semver.org/), nhưng không bắt buộc.

## Ví Dụ

Xem các repository sau đây, là các Plugin mẫu tốt để tham khảo:

- [pixlcore/xyplug-bluesky](https://github.com/pixlcore/xyplug-bluesky)
- [pixlcore/xyplug-stagehand](https://github.com/pixlcore/xyplug-stagehand)

## Nộp Bài Lên Marketplace

Khi bạn đã sẵn sàng xuất bản Plugin của mình, hãy truy cập repository GitHub của marketplace:

https://github.com/pixlcore/xyops-marketplace

Tạo một pull request, và thêm metadata Plugin của bạn vào file `marketplace.json`, cụ thể là một object mới ở cuối mảng `rows`. Nó nên được định dạng như sau:

```json
{
	"id": "pixlcore/xyplug-stagehand",
	"title": "Stagehand",
	"author": "PixlCore",
	"description": "An AI-powered browser automation framework for PTOps.  Drive a headless browser with simple English instructions, take actions, extract data, capture network requests, and even record a video of the whole session.",
	"versions": ["v1.0.9", "v1.0.8", "v1.0.7"],
	"type": "plugin",
	"plugin_type": "event",
	"license": "MIT",
	"tags": ["Stagehand", "Playwright"],
	"requires": [ "docker" ],
	"env": { "AI_API_KEY": "" },
	"created": "2026-01-01",
	"modified": "2026-01-02"
}
```

Đây là mô tả các thuộc tính:

| Tên Thuộc Tính | Kiểu | Mô Tả |
|---------------|------|-------------|
| `id` | String | ID của Plugin của bạn, nên là GitHub Org và repo ID của bạn, nối bằng dấu gạch chéo. |
| `title` | String | Tiêu đề cho Plugin của bạn. Hiển thị đậm trong marketplace. |
| `author` | String | Tác giả của Plugin (công ty hoặc cá nhân). |
| `description` | String | Mô tả ngắn về Plugin của bạn. Hiển thị dưới tiêu đề trong marketplace. |
| `versions` | Array | Một mảng string đã sắp xếp chứa tất cả phiên bản (git tag) có sẵn của Plugin. Phiên bản mới nhất nên liệt kê đầu tiên. |
| `type` | String | Loại mục bạn đang xuất bản. Set thành `plugin` cho v1 (sẽ được mở rộng trong tương lai). |
| `plugin_type` | String | Nếu nộp một plugin, thuộc tính này chỉ định loại plugin. Nên là một trong: `event`, `action`, `monitor` hoặc `scheduler`. Bạn có thể tìm giá trị này trong dữ liệu export của Plugin. |
| `license` | String | [SPDX Identifier](https://spdx.org/licenses/) cho license mã nguồn mở mà Plugin của bạn sử dụng (phải được OSI công nhận). |
| `tags` | Array | Một mảng chuỗi từ khoá, dùng để tìm kiếm. |
| `requires` | Array | Liệt kê các yêu cầu CLI để khởi chạy Plugin của bạn, ví dụ `npx`, `uvx`, `go run` và/hoặc `docker`. |
| `env` | Object | Object tuỳ chọn chứa tên secret key mặc định và giá trị placeholder. Xem [Secrets](#secrets) bên dưới. |
| `created` | String | Ngày xuất bản lần đầu, theo định dạng YYYY-MM-DD. |
| `modified` | String | Ngày của phiên bản mới nhất, theo định dạng YYYY-MM-DD. |

Lưu ý rằng tất cả Plugin nộp lên đều được con người xét duyệt. Vui lòng chuẩn bị chờ vài ngày trước khi Plugin của bạn được phê duyệt. Nếu Plugin của bạn bị từ chối, một thành viên team PTOps sẽ giải thích lý do, và giúp bạn nộp lại với các thay đổi cần thiết để được phê duyệt.

## Secrets

Nếu plugin của bạn sử dụng [secrets](secrets.md), bạn có thể cung cấp gợi ý để PTOps giúp người dùng thiết lập secret vault. Chỉ cần thêm một object `env` trong metadata marketplace của bạn, định dạng như sau:

```json
"env": {
	"VARIABLE1": "",
	"VARIABLE2": ""
}
```

Bạn có thể tuỳ chọn cung cấp giá trị mặc định, nhưng để trống thường là tốt nhất.

Bằng cách cung cấp thông tin này, PTOps sẽ hiển thị cho người dùng một nút "Secret Vault" ở phần header trên cùng của trang sản phẩm marketplace của bạn (sau khi cài đặt). Nhấn vào đó sẽ bắt đầu một secret vault draft mới, với tiêu đề, plugin và tên biến secret đã điền sẵn cho người dùng. Hoặc, nếu Plugin của bạn đã có secret vault gán sẵn, nút này sẽ đơn giản chuyển hướng người dùng đến trang vault hiện có.

## Tự Phân Phối

Bạn có thể tự do phân phối Plugin của mình bên ngoài PTOps Marketplace. Để làm điều này, chỉ cần [export](#export-plugin-data) Plugin của bạn theo hướng dẫn trên, và host file [PTOps Portable Data](xypdf.md) trên website của riêng bạn, hoặc chia sẻ như bất kỳ file số nào khác. Bất kỳ ai chạy PTOps với quyền tài khoản phù hợp (cụ thể là [create_plugins](privileges.md#create_plugins) và [edit_plugins](privileges.md#edit_plugins), hoặc [admin](privileges.md#admin)) đều có thể import Plugin của bạn.

Nên:

- Cấu hình web server của bạn để bao gồm header `Content-Disposition: attachment`, để browser tải file khi được nhấn, hoặc...
- Nén file bằng Gzip trước, và host phiên bản `.json.gz`.

Để import một Plugin tự phân phối vào PTOps, người dùng chỉ cần điều hướng đến Danh Sách Plugin bằng cách nhấn liên kết "**Plugins**" ở sidebar, sau đó nhấn nút "**Import File...**", hoặc kéo & thả file đã tải xuống vào cửa sổ browser. Họ sẽ được nhắc để import Plugin, và ngay lúc đó có thể sử dụng ngay trong event và workflow.

Lưu ý rằng người dùng có trách nhiệm cài đặt các điều kiện tiên quyết cần thiết như `npx`, `uvx`, v.v. Những công cụ này đã được cài sẵn trên PTOps Docker container chính thức, nên nếu người dùng cài PTOps qua Docker, sẽ không cần cài thêm phần mềm nào.
