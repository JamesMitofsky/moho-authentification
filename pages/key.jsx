import CodeOfDay from "../components/CodeOfDay";
import WelcomeText from "../components/WelcomeText";
import NoCodeToday from "../components/NoCodeToday";
import Loading from "../components/Loading";
import MarginProvider from "../components/layouts/MarginProvider";

import getCodeFromWeekdays from "../functions/getCodeFromWeekdays";

import { getDoc, doc } from "firebase/firestore";
import { db } from "../services/firebase";

import { Grid, TextField, Button } from "@mui/material";

import { useState } from "react";
import { useEffect } from "react";

import Head from "next/head";
import Router, { useRouter } from "next/router";

import setState from "../functions/setState";

export default function Key() {
  const [codeData, setCodeData] = useState("");
  const [param, setParam] = useState("");
  const [states, setStates] = useState({
    loading: true,
    noCode: false,
    showCode: false,
  });

  const { query, isReady } = useRouter();
  useEffect(() => {
    // don't continue evaluating function until certain there's no URL param inbound
    if (!isReady) return;

    // does correct key exist in URL?
    const codeKey = Object.keys(query).find((key) => key === "value");
    if (codeKey !== "value" || !query.value) {
      setState(setStates, "noCode");
      console.log("Incorrect URL param key was provided");
      return;
    }

    databaseSearch();
  }, [isReady]);

  async function databaseSearch() {
    // fetch object from firestore using the key
    const docRef = doc(db, "globalKeys", query["value"]);
    const res = await getDoc(docRef);
    if (!res.exists()) {
      setState(setStates, "noCode");
      return;
    }

    // TODO: handle error: weekday won't exist on weekends
    const arrayOfWeekdays = res.data()?.weekdays;

    const qrCodeValue = getCodeFromWeekdays(arrayOfWeekdays);
    setCodeData(qrCodeValue.code);
    setState(setStates, "showCode");
  }
  console.log(codeData);

  function inputSubmitted() {
    databaseSearch();
  }

  return (
    <>
      <Head>
        <title>Votre Clé — {query["value"]}</title>
      </Head>
      <MarginProvider>
        <Grid
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1,
          }}
        >
          {states.noCode && (
            <>
              <WelcomeText />
              <TextField
                fullWidth
                label="Enter your key name"
                value={param.userInput}
                onChange={(e) =>
                  setParam(() => {
                    Router.push({
                      pathname: "/key",
                      query: { value: e.target.value },
                    });
                    return e.target.value;
                  })
                }
              />
              <Button fullWidth onClick={inputSubmitted}>
                Search
              </Button>
            </>
          )}

          {states.showCode && (
            <>
              <CodeOfDay value={codeData} />
              {/* {!codeData && <NoCodeToday />} */}
              <WelcomeText />
            </>
          )}
        </Grid>

        <Loading loaded={!states.loading} />
      </MarginProvider>
    </>
  );
}
