import { ReactNode, useEffect, useState } from "react";
import { StatusType } from "../types";

export const FlagInterpreter = () => {
  const [status, setStatus] = useState(StatusType.Idle);
  const [statusMsg, setStatusMsg] = useState<unknown>();
  const [payload, setPayload] = useState<string>();
  const [content, setContent] = useState<ReactNode[]>([]);

  const FlagList = () => {
    return (
      <>
        heyo
        {content.map((item, i) => {
          return <li key={`li-${i}`}>{item}</li>;
        })}
      </>
    );
  };

  const buildValueFromSelector = (selector: any) => {
    let value = "";
    if (selector?.attributes.value) {
      value = value.concat(selector.attributes.value.nodeValue);
    }
    // if (selector?.attributes['data-id']) { value = value.concat(selector.attributes['data-class'].nodeValue) }
    // if (selector?.attributes['data-class']) { value = value.concat(selector.attributes['data-class'].nodeValue) }
    // if (selector?.attributes['data-tag']) { value = value.concat(selector.attributes['data-class'].nodeValue) }
    // console.log("selector", selector);

    return value;
  };

  const buildFlag = (payload: string) => {
    const parser = new DOMParser();
    const parsedPayload = parser.parseFromString(payload, "text/html");
    const selectors = parsedPayload.querySelectorAll(
      "[value], [data-id], [data-class], [data-tag]"
    );

    selectors.forEach((selector) =>
      setContent((prev) => [...prev, buildValueFromSelector(selector)])
    );
  };

  const fetchSecretUrl = async (url: string) => {
    setStatus(StatusType.Loading);
    setStatusMsg("Loading");

    try {
      const response = await fetch(url);

      if (!response.ok) {
        setStatus(StatusType.Error);
        setStatusMsg(response.status);
        throw new Error(
          `We couldn't get a good response from the URL you requested but here's the status it returned: ${response.status}.`
        );
      }

      const responseBody = await response.text();
      buildFlag(responseBody);
      setStatus(StatusType.Success);
    } catch (error) {
      setStatus(StatusType.Error);
      console.log(
        `We couldn't get the URL you requested but here's the error it returned: ${error}`
      );
    }
  };

  useEffect(() => {
    const secretUrl =
      "https://tns4lpgmziiypnxxzel5ss5nyu0nftol.lambda-url.us-east-1.on.aws/challenge";

    fetchSecretUrl(secretUrl);
  }, [setStatus, setStatusMsg, setPayload]);

  const Content = new Map([
    [StatusType.Loading, "Loading"],
    [StatusType.Error || StatusType.Loading, statusMsg],
    [StatusType.Success, <FlagList />],
  ]);

  return Content.get(status);
};
