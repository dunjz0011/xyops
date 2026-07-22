# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=22
ARG XYSAT_VERSION=v1.0.37
ARG UV_VERSION=0.11.30

FROM node:${NODE_VERSION}-bookworm-slim AS builder

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

ARG XYSAT_VERSION

RUN apt-get update && apt-get install -y --no-install-recommends \
	build-essential \
	ca-certificates \
	curl \
	git \
	libc6-dev \
	libffi-dev \
	libssl-dev \
	pkg-config \
	python3 \
	python3-setuptools \
	zlib1g-dev \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /opt/xyops

# Install dependencies before copying the source so this layer remains cacheable.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN chmod 644 node_modules/useragent-ng/lib/regexps.js \
	&& node bin/build.js dist \
	&& npm prune --omit=dev

# Pin xySat to a released version instead of building from the moving main branch.
RUN mkdir -p /opt/xyops/satellite \
	&& curl -fsSL "https://github.com/pixlcore/xysat/archive/refs/tags/${XYSAT_VERSION}.tar.gz" \
		| tar -xz -C /opt/xyops/satellite --strip-components=1 \
	&& npm --prefix /opt/xyops/satellite ci --omit=dev

FROM node:${NODE_VERSION}-bookworm-slim AS runtime

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

ARG UV_VERSION

LABEL org.opencontainers.image.title="PTOps"
LABEL org.opencontainers.image.source="https://github.com/dunjz0011/xyops"
LABEL org.opencontainers.image.description="PTOps workflow automation and server monitoring system."
LABEL org.opencontainers.image.licenses="BSD-3-Clause"

# Keep the runtime tools used by built-in plugins and the marketplace, but leave
# compilers and development headers behind in the builder image.
RUN DEBIAN_FRONTEND=noninteractive apt-get update \
	&& DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
		bzip2 \
		ca-certificates \
		curl \
		dnsutils \
		git \
		iproute2 \
		iputils-ping \
		lsof \
		openssh-client \
		openssl \
		procps \
		tini \
		tzdata \
		unzip \
		xz-utils \
		zip \
	&& . /etc/os-release \
	&& install -m 0755 -d /etc/apt/keyrings \
	&& curl -fsSL "https://download.docker.com/linux/${ID}/gpg" -o /etc/apt/keyrings/docker.asc \
	&& chmod a+r /etc/apt/keyrings/docker.asc \
	&& ARCH="$(dpkg --print-architecture)" \
	&& echo "deb [arch=${ARCH} signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/${ID} ${VERSION_CODENAME} stable" \
		> /etc/apt/sources.list.d/docker.list \
	&& apt-get update \
	&& apt-get install -y --no-install-recommends docker-ce-cli \
	&& rm -rf /var/lib/apt/lists/*

RUN export UV_INSTALL_DIR=/usr/local/bin UV_NO_MODIFY_PATH=1 \
	&& curl -LsSf "https://astral.sh/uv/${UV_VERSION}/install.sh" | sh

WORKDIR /opt/xyops
COPY --from=builder /opt/xyops /opt/xyops

RUN mkdir -p /opt/xyops/conf /opt/xyops/data /opt/xyops/logs /opt/xyops/temp

ENV XYOPS_foreground=true \
	XYOPS_color=true \
	XYOPS_echo="xyOps Transaction Error error API Unbase Action Comm Job Workflow Maint Multi Scheduler SSO User Ticket Alert" \
	NODE_MAX_MEMORY=4096

VOLUME ["/opt/xyops/conf", "/opt/xyops/data", "/opt/xyops/logs"]

EXPOSE 5522/tcp
EXPOSE 5523/tcp

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
	CMD node -e "fetch('http://127.0.0.1:5522/api/app/ping').then((res) => { if (!res.ok) process.exit(1); }).catch(() => process.exit(1))"

STOPSIGNAL SIGTERM
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["bin/container-start.sh"]
