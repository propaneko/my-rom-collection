import { isEmpty } from "lodash";
import { stringSimilarity } from "string-similarity-js";
import { getSystems } from "./getSystems";
import { Ssuser } from "@/app/api/local/roms/types";
import { createDefaultUrl } from "../../helpers/createDefaultUrl";

export interface Name {
  region: string;
  text: string;
}

export interface Data {
  id: string;
  noms: Name[];
}

function findClosest(inputText: string, data: Data[], minScore = 0.5) {
  const normalize = (value: string): string =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 ]/g, "")
      .trim();

  const normalizedInput = normalize(inputText);
  let bestJeu = null;
  let bestScore = 0;

  for (const jeu of data) {
    for (const nom of jeu.noms) {
      const score = stringSimilarity(normalizedInput, normalize(nom.text));
      console.log(
        `Comparing "${normalizedInput}" with "${normalize(
          nom.text,
        )}" => score: ${score}`,
      );
      if (score > bestScore) {
        bestScore = score;
        bestJeu = jeu;
      }
    }
  }

  return bestScore >= minScore ? bestJeu : null;
}

const createFinalUrl = (romName: string, romSystem: string): string => {
  const defaultUrl = createDefaultUrl("jeuRecherche.php")
  const systems = getSystems();
  const system = systems.find(
    (sys) => sys.name.toLowerCase() === romSystem.toLowerCase(),
  );

  const urlParamSystem = system ? `systemeid=${system.id}` : "";

  return `${defaultUrl}&${urlParamSystem}&output=json&softname=zzz&recherche=${romName}`;
};

export const getGameInfo = async (romName: string, romSystem: string) => {
  const finalUrl = createFinalUrl(romName, romSystem);
  
  const response = await fetch(finalUrl);

  if (!response.ok) {
    throw new Error(`ScreenScraper API responded with ${response.status}`);
  }

  const result = await response.json();

  if (isEmpty(result.response.jeux) || isEmpty(result.response.jeux[0])) {
    return {
      gameInfo: null,
      header: result.response.ssuser as Ssuser,
    };
  }

  console.log(result.response.jeux.length);

  if (result.response.jeux.length === 1) {
    return {
      gameInfo: result.response.jeux[0],
      header: result.response.ssuser as Ssuser,
    };
  }

  const game = findClosest(romName, result.response.jeux || []);
  return {
    gameInfo: isEmpty(game) ? null : game,
    header: result.response.ssuser as Ssuser,
  };
};