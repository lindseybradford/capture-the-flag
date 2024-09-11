import { ReactNode, useCallback, useEffect, useState } from "react";
import { StatusType } from "../types";

export const FlagFinder = () => {
  const secretUrl =
    "https://tns4lpgmziiypnxxzel5ss5nyu0nftol.lambda-url.us-east-1.on.aws/challenge";
  const [status, setStatus] = useState(StatusType.Idle);
  const [statusMsg, setStatusMsg] = useState<string>("Loading");
  const [chars, setChars] = useState<ReactNode[]>([]);

  const CharPrinter = () => {
    return (
      <>
        {chars.map((item, i) => {
          return <li key={`li-${i}`}>{item}</li>;
        })}
      </>
    );
  };

  const StatusMessage = ({ msg }: { msg: string }) => {
    return <>{msg}</>;
  };

  const parseCharPayload = (charPayload: any) => {
    const parser = new DOMParser();
    const parsedPayload = parser.parseFromString(charPayload, "text/html");
    const selectors = parsedPayload.querySelectorAll(
      '[data-class^="23"] [data-tag$="93"] [data-id*="21"] i.char'
    );
    selectors.forEach((selector, i) => {
      setTimeout(
        () => setChars((prev) => [...prev, selector.attributes[1].nodeValue!]),
        1000 * i
      );
    });
  };

  const fetchSecretUrl = useCallback(async (url: string) => {
    setStatus(StatusType.Loading);
    setStatusMsg("Loading");
    try {
      const data = await fetch(url);

      if (data.ok) {
        const response = await data.text();
        parseCharPayload(response);
        setStatus(StatusType.Success);
        setStatusMsg("Success");
      }
    } catch (error) {
      const errorMsg = `We couldn't get the URL you requested but here's the error it returned: ${error}`;
      setStatus(StatusType.Error);
      setStatusMsg(errorMsg);
    }
  }, []);

  useEffect(() => {
    fetchSecretUrl(secretUrl);
  }, [fetchSecretUrl]);

  return status === StatusType.Success ? (
    <CharPrinter />
  ) : (
    <StatusMessage msg={statusMsg} />
  );
};
