from __future__ import annotations
import time
import json
from typing import Any, Dict, Generator, Iterable, List, Optional, Union
import requests


class MartianAPIError(Exception):
    """Raised on non-2xx responses from Martian."""


class MartianClient:
    def __init__(
        self,
        api_key: str,
        *,
        gateway_base: str = "https://api.withmartian.com/v1",
        openai_base: str = "https://api.withmartian.com/v1",
        org_id: Optional[str] = None,
        timeout: int = 60,
        session: Optional[requests.Session] = None,
    ):
        if not api_key:
            raise ValueError("api_key is required")
        self.api_key = api_key
        self.gateway_base = gateway_base.rstrip("/")
        self.openai_base = openai_base.rstrip("/")
        self.timeout = timeout
        self.org_id = org_id
        self.http = session or requests.Session()
        self.http.headers.update(
            {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            }
        )
    def _request(
        self,
        method: str,
        url: str,
        *,
        params: Optional[Dict[str, Any]] = None,
        json_body: Optional[Dict[str, Any]] = None,
        stream: bool = False,
    ) -> requests.Response:
        resp = self.http.request(
            method=method,
            url=url,
            params=params,
            json=json_body,
            timeout=self.timeout,
            stream=stream,
        )
        if not resp.ok:
            details = None
            try:
                details = resp.json()
            except Exception:
                details = resp.text
            raise MartianAPIError(f"{resp.status_code} {resp.reason}: {details}")
        return resp

    def chat_completions(
        self,
        *,
        model: Union[str, List[str]] = "router",
        messages: List[Dict[str, str]],
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        **kwargs: Any,
    ) -> Dict[str, Any]:
        """
        Create a chat completion. Set model='router' to enable auto model selection.
        Accepts any standard OpenAI Chat fields (tools, tool_choice, top_p, etc.).
        """
        payload: Dict[str, Any] = {"model": model, "messages": messages}
        if max_tokens is not None:
            payload["max_tokens"] = max_tokens
        if temperature is not None:
            payload["temperature"] = temperature
        if kwargs:
            payload.update(kwargs)
        url = f"{self.openai_base}/chat/completions"
        resp = self._request("POST", url, json_body=payload)
        return resp.json()

    def stream_chat_completions(
        self,
        *,
        model: Union[str, List[str]] = "router",
        messages: List[Dict[str, str]],
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        **kwargs: Any,
    ) -> Generator[Dict[str, Any], None, None]:
        payload: Dict[str, Any] = {
            "model": model,
            "messages": messages,
            "stream": True,
        }
        if max_tokens is not None:
            payload["max_tokens"] = max_tokens
        if temperature is not None:
            payload["temperature"] = temperature
        if kwargs:
            payload.update(kwargs)

        url = f"{self.openai_base}/chat/completions"
        resp = self._request("POST", url, json_body=payload, stream=True)

        for line in resp.iter_lines(decode_unicode=True):
            if not line:
                continue
            if line.startswith("data: "):
                data = line[len("data: ") :].strip()
                if data == "[DONE]":
                    break
                try:
                    yield json.loads(data)
                except json.JSONDecodeError:
                    yield {"raw": data}

    def embeddings(
        self,
        *,
        model: Union[str, List[str]] = "router",
        input: Union[str, List[str]],
        **kwargs: Any,
    ) -> Dict[str, Any]:
        payload: Dict[str, Any] = {"model": model, "input": input}
        if kwargs:
            payload.update(kwargs)
        url = f"{self.openai_base}/embeddings"
        resp = self._request("POST", url, json_body=payload)
        return resp.json()

    def list_models(self) -> Dict[str, Any]:
        url = f"{self.openai_base}/models"
        return self._request("GET", url).json()

    def get_model(self, model: str) -> Dict[str, Any]:
        url = f"{self.openai_base}/models/{model}"
        return self._request("GET", url).json()

    def create_router(self, router_id: str, base_model: str, description: Optional[str] = None) -> Dict[str, Any]:
        url = f"{self.gateway_base}/routers"
        body = {"router_id": router_id, "base_model": base_model}
        if description:
            body["description"] = description
        return self._request("POST", url, json_body=body).json()

    def update_router(self, router_id: str, router_spec: Dict[str, Any], description: Optional[str] = None) -> Dict[str, Any]:
        url = f"{self.gateway_base}/routers/{router_id}"
        body = {"router_spec": router_spec}
        if description is not None:
            body["description"] = description
        return self._request("PATCH", url, json_body=body).json()

    def list_routers(self) -> List[Dict[str, Any]]:
        url = f"{self.gateway_base}/routers"
        return self._request("GET", url).json()

    def get_router(self, router_id: str, version: Optional[int] = None) -> Optional[Dict[str, Any]]:
        params = {"version": version} if version is not None else None
        url = f"{self.gateway_base}/routers/{router_id}"
        resp = self._request("GET", url, params=params)
        # May return 200 with null if not found depending on server; errors bubble otherwise
        return resp.json()

    def run_router(
        self,
        router_id: str,
        routing_constraint: Dict[str, Any],
        completion_request: Dict[str, Any],
        version: Optional[int] = None,
    ) -> Dict[str, Any]:
        url = f"{self.gateway_base}/routers/{router_id}:run"
        body = {
            "routing_constraint": routing_constraint,
            "completion_request": completion_request,
        }
        if version is not None:
            body["version"] = version
        return self._request("POST", url, json_body=body).json()

    def run_router_training_job(
        self,
        *,
        router_id: str,
        judge_id: str,
        llms: List[str],
        requests_set: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        url = f"{self.gateway_base}/router_training_jobs"
        body = {
            "router_id": router_id,
            "judge_id": judge_id,
            "llms": llms,
            "requests": requests_set,
        }
        return self._request("POST", url, json_body=body).json()

    def poll_training_job(self, job_name: str) -> Dict[str, Any]:
        url = f"{self.gateway_base}/router_training_jobs/{job_name}"
        return self._request("GET", url).json()

    def wait_training_job(self, job_name: str, poll_interval: int = 10, poll_timeout: int = 1200) -> Dict[str, Any]:
        start = time.time()
        while True:
            state = self.poll_training_job(job_name)
            status = (state or {}).get("status")
            if status in {"SUCCESS", "FAILURE", "FAILURE_WITHOUT_RETRY"}:
                return state
            if time.time() - start > poll_timeout:
                raise TimeoutError(f"Training job '{job_name}' did not complete in {poll_timeout}s")
            time.sleep(poll_interval)

    def create_judge(self, judge_id: str, judge_spec: Dict[str, Any], description: Optional[str] = None) -> Dict[str, Any]:
        url = f"{self.gateway_base}/judges"
        body = {"judge_id": judge_id, "judge_spec": judge_spec}
        if description:
            body["description"] = description
        return self._request("POST", url, json_body=body).json()

    def update_judge(self, judge_id: str, judge_spec: Dict[str, Any]) -> Dict[str, Any]:
        url = f"{self.gateway_base}/judges/{judge_id}"
        body = {"judge_spec": judge_spec}
        return self._request("PATCH", url, json_body=body).json()

    def list_judges(self) -> List[Dict[str, Any]]:
        url = f"{self.gateway_base}/judges"
        return self._request("GET", url).json()

    def get_judge(self, judge_id: str, version: Optional[int] = None) -> Optional[Dict[str, Any]]:
        params = {"version": version} if version is not None else None
        url = f"{self.gateway_base}/judges/{judge_id}"
        resp = self._request("GET", url, params=params)
        return resp.json()

    def get_judge_versions(self, judge_id: str) -> List[Dict[str, Any]]:
        url = f"{self.gateway_base}/judges/{judge_id}/versions"
        return self._request("GET", url).json()

    def render_judge_prompt(
        self,
        judge_id: str,
        completion_request: Dict[str, Any],
        completion_response: Dict[str, Any],
    ) -> Dict[str, Any]:
        url = f"{self.gateway_base}/judges/{judge_id}:render_prompt"
        body = {"completion_request": completion_request, "completion_response": completion_response}
        return self._request("POST", url, json_body=body).json()

    def evaluate_with_judge(
        self,
        judge_id: str,
        completion_request: Dict[str, Any],
        completion_response: Dict[str, Any],
    ) -> Dict[str, Any]:
        url = f"{self.gateway_base}/judges/{judge_id}:evaluate"
        body = {"completion_request": completion_request, "completion_response": completion_response}
        return self._request("POST", url, json_body=body).json()

    def evaluate_with_spec(
        self,
        judge_spec: Dict[str, Any],
        completion_request: Dict[str, Any],
        completion_response: Dict[str, Any],
    ) -> Dict[str, Any]:
        url = f"{self.gateway_base}/judge_specs:evaluate"
        body = {
            "judge_spec": judge_spec,
            "completion_request": completion_request,
            "completion_response": completion_response,
        }
        return self._request("POST", url, json_body=body).json()

    def get_credit_balance(self) -> Dict[str, Any]:
        url = f"{self.gateway_base}/organization/credits"
        return self._request("GET", url).json()