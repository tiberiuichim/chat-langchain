# FROM python:3.11-buster
#
# RUN pip install poetry==1.5.1
#
# RUN poetry config virtualenvs.create false
#
# COPY ./pyproject.toml ./poetry.lock* ./
#
# RUN poetry install --no-interaction --no-ansi --no-root --no-directory
#
# COPY ./*.py ./
#
# RUN poetry install  --no-interaction --no-ansi
#
# CMD exec uvicorn main:app --host 0.0.0.0 --port 8080

# BUILDER
FROM nvidia/cuda:12.1.1-devel-ubuntu22.04 as builder
WORKDIR /builder
ARG TORCH_CUDA_ARCH_LIST="${TORCH_CUDA_ARCH_LIST:-3.5;5.0;6.0;6.1;7.0;7.5;8.0;8.6+PTX}"
ARG BUILD_REQUIREMENTS="${BUILD_REQUIREMENTS:-requirements.txt}"
ARG APP_UID="${APP_UID:-6972}"
ARG APP_GID="${APP_GID:-6972}"
# create / update build env
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked,rw \
    apt update && \
    apt install --no-install-recommends -y git vim build-essential python3-dev pip && \
    rm -rf /var/lib/apt/lists/*
RUN --mount=type=cache,target=/root/.cache/pip,rw \
    pip3 install --global --upgrade pip wheel setuptools && \
    # make shared builder & runtime app user
    addgroup --gid $APP_GID app_grp && \
    useradd -m -u $APP_UID --gid app_grp app
USER app:app_grp
# build wheels for runtime
WORKDIR /home/app/build
COPY --chown=app:app_grp "$BUILD_REQUIREMENTS" /home/app/build/requirements.txt
# COPY --chown=app:app_grp extensions /home/app/build/extensions
RUN --mount=type=cache,target=/root/.cache/pip,rw \
    # build all requirements files as wheel dists
    pip3 wheel -w wheels -r requirements.txt
    # drop wheel and setuptools .whl to avoid install issues
RUN rm wheels/setuptools*.whl

# RUNTIME
FROM nvidia/cuda:12.1.1-runtime-ubuntu22.04
ARG TORCH_CUDA_ARCH_LIST="${TORCH_CUDA_ARCH_LIST:-3.5;5.0;6.0;6.1;7.0;7.5;8.0;8.6}"
ARG APP_UID="${APP_UID:-6972}"
ARG APP_GID="${APP_GID:-6972}"
ENV CLI_ARGS=""
# create / update runtime env
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked,rw \
    apt update && \
    apt install --no-install-recommends -y git python3 pip && \
    rm -rf /var/lib/apt/lists/* && \
    pip3 install --global --no-cache --upgrade pip wheel setuptools && \
    # make shared builder & runtime app user
    addgroup --gid $APP_GID app_grp && \
    useradd -m -u $APP_UID --gid app_grp app
USER app:app_grp
# install locally built wheels for app
WORKDIR /home/app/wheels
COPY --from=builder /home/app/build/wheels /home/app/wheels
COPY --chown=app:app_grp . /home/app/chat
RUN umask 0002 && \
    chmod g+rwX /home/app/chat && \
    pip3 install --global --no-build-isolation --no-cache --no-index ./*.whl && \
    rm -r /home/app/wheels
WORKDIR /home/app/chat
EXPOSE ${CONTAINER_PORT:-8080}
# set umask to ensure group read / write at runtime
# export HOME=/home/app/chat
CMD umask 0002 && cd /home/app/chat && exec /home/app/.local/bin/uvicorn main:app --host 0.0.0.0 --port ${CONTAINER_PORT:-8080} ${CLI_ARGS}
