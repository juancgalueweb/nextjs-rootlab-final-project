import { GetStaticProps, GetStaticPaths, NextPage } from "next";
import { ApplicationWrapper } from "../../components/layout/ApplicationWrapper";
import { ICocktail } from "../../global/ICocktail";
import { Card, Tag, Collapse, Button } from "antd";
import Image from "next/image";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { imageCreditsName } from "../../helpers/imageCreditsName";
import { imageCreditsUrl } from "../../helpers/imageCreditsUrl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faYoutube } from "@fortawesome/free-brands-svg-icons";
import {
  faArrowRightLong,
  faArrowLeftLong,
} from "@fortawesome/free-solid-svg-icons";
import { fetchCocktailById } from "../../helpers/fetchCocktailById";
import { fetchAllCocktails } from "../../helpers/fetchAllCocktails";
import { getPlaiceholder } from "plaiceholder";

const { Panel } = Collapse;
interface TProps {
  drink: ICocktail;
  nextId: number;
  prevId: number;
  hasNextId: boolean;
  hasPrevId: boolean;
  allIds: string[];
}

export const getStaticPaths: GetStaticPaths = async () => {
  const drinks = await fetchAllCocktails();
  const paths = drinks?.map((drink: ICocktail) => {
    return {
      params: { idDrink: drink.idDrink },
    };
  });
  return { paths: paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const id = context.params?.idDrink as string;
  // Get all drinks to build a list with all the ids
  const allDrinks = await fetchAllCocktails();
  const allIds = allDrinks?.map((drink: ICocktail) => drink.idDrink);
  const nextId: number = allIds.indexOf(id) + 1;
  const prevId: number = allIds.indexOf(id) - 1;
  const hasNextId: boolean = allIds.includes(allIds[nextId]);
  const hasPrevId: boolean = allIds.includes(allIds[prevId]);
  // Get a single drink by its id
  const singleDrink = await fetchCocktailById(id);
  const { base64, img } = await getPlaiceholder(singleDrink.strDrinkThumb);
  const drink = { ...singleDrink, base64, img };

  return {
    props: {
      drink,
      nextId,
      prevId,
      hasNextId,
      hasPrevId,
      allIds,
    },
  };
};

const engInstructionsCollapseKey = uuidv4();

const PopularCocktailDetailPage: NextPage<TProps> = ({
  drink,
  nextId,
  prevId,
  hasNextId,
  hasPrevId,
  allIds,
}) => {
  return (
    <ApplicationWrapper title={drink.strDrink}>
      <div
        key={uuidv4()}
        className="min-h-screen flex flex-col justify-center items-center bg-slate-200"
      >
        <h1 className="text-4xl py-3 font-semibold text-transparent bg-clip-text bg-gradient-to-br from-pink-400 to-red-600">
          {drink.strDrink}
        </h1>
        <div className="md:w-3/5 lg:w-1/2 xl:w-1/3 flex justify-between">
          {hasPrevId ? (
            <Link
              href={`/popular-cocktails/${allIds[+prevId]}`}
              className="text-gray-600 text-lg font-medium mb-3 mr-5"
            >
              <FontAwesomeIcon
                icon={faArrowLeftLong}
                className="mr-2 fa-beat"
                style={{ animationDuration: "2s" }}
              ></FontAwesomeIcon>{" "}
              Previous
            </Link>
          ) : (
            <span> </span>
          )}
          {hasNextId && (
            <Link
              href={`/popular-cocktails/${allIds[+nextId]}`}
              className="text-gray-600 text-lg font-medium mb-3 ml-5"
            >
              Next{" "}
              <FontAwesomeIcon
                icon={faArrowRightLong}
                className="ml-2 fa-beat"
                style={{ animationDuration: "2s" }}
              ></FontAwesomeIcon>
            </Link>
          )}
        </div>
        <Card
          hoverable
          className="mb-6 cursor-default md:max-w-[600px] lg:min-w-[600px] xl:min-w-[600px]"
          cover={
            <div className="flex justify-center mt-2">
              <Image
                src={drink.img}
                alt={`${drink.strDrink} Image`}
                width={500}
                height={500}
                blurDataURL={drink.base64}
                placeholder="blur"
                style={{ borderRadius: "4px", margin: "0 auto" }}
              />
            </div>
          }
          extra={
            <Button type="primary" href="/popular-cocktails" className="my-3">
              Go Back
            </Button>
          }
        >
          {imageCreditsName(drink.strImageAttribution) &&
          imageCreditsUrl(drink.strImageAttribution) ? (
            <p className="text-right text-sm font-thin">
              Image by {imageCreditsName(drink.strImageAttribution)} via{" "}
              <a
                href={imageCreditsUrl(drink.strImageAttribution)}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-800"
              >
                {"[source link]"}
              </a>
            </p>
          ) : imageCreditsName(drink.strImageAttribution) &&
            !imageCreditsUrl(drink.strImageAttribution) ? (
            <p className="text-right text-sm font-thin">
              Image by {imageCreditsName(drink.strImageAttribution)}
            </p>
          ) : null}

          <Tag
            className="mt-3 mr-3"
            color={drink.strAlcoholic === "Alcoholic" ? "magenta" : "green"}
          >
            {drink.strAlcoholic}
          </Tag>
          {drink.strVideo ? (
            <a href={drink.strVideo} target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon
                icon={faYoutube}
                size="lg"
                className="text-[#FF0000]"
              ></FontAwesomeIcon>
            </a>
          ) : null}
          <h2 className="text-lg py-2">Type of glass</h2>
          <p>{drink.strGlass}</p>
          {drink.strTags && <h2 className="text-lg py-2">Tags</h2>}
          {drink.strTags?.split(",").map((ele) => (
            <Tag key={uuidv4()} className="mt-3 mr-3" color="blue">
              {ele}
            </Tag>
          ))}
          <table className="table-auto min-w-full divide-y divide-gray-200 my-6">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase "
                >
                  Ingredient
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase "
                >
                  Measure
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                {drink.strIngredient1 && (
                  <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                    {drink.strIngredient1}
                  </td>
                )}
                {drink.strMeasure1 && (
                  <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                    {drink.strMeasure1}
                  </td>
                )}
              </tr>
              <tr>
                {drink.strIngredient2 && (
                  <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                    {drink.strIngredient2}
                  </td>
                )}
                {drink.strMeasure2 && (
                  <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                    {drink.strMeasure2}
                  </td>
                )}
              </tr>
              <tr>
                {drink.strIngredient3 && (
                  <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                    {drink.strIngredient3}
                  </td>
                )}
                {drink.strMeasure3 && (
                  <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                    {drink.strMeasure3}
                  </td>
                )}
              </tr>
              <tr>
                {drink.strIngredient4 && (
                  <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                    {drink.strIngredient4}
                  </td>
                )}
                {drink.strMeasure4 && (
                  <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                    {drink.strMeasure4}
                  </td>
                )}
              </tr>
              <tr>
                {drink.strIngredient5 && (
                  <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                    {drink.strIngredient5}
                  </td>
                )}
                {drink.strMeasure5 && (
                  <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                    {drink.strMeasure5}
                  </td>
                )}
              </tr>
              <tr>
                {drink.strIngredient6 && (
                  <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                    {drink.strIngredient6}
                  </td>
                )}
                {drink.strMeasure6 && (
                  <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                    {drink.strMeasure6}
                  </td>
                )}
              </tr>
              <tr>
                {drink.strIngredient7 && (
                  <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                    {drink.strIngredient7}
                  </td>
                )}
                {drink.strMeasure7 && (
                  <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                    {drink.strMeasure7}
                  </td>
                )}
              </tr>
              <tr>
                {drink.strIngredient8 && (
                  <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                    {drink.strIngredient8}
                  </td>
                )}
                {drink.strMeasure8 && (
                  <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                    {drink.strMeasure8}
                  </td>
                )}
              </tr>
            </tbody>
          </table>
          <Collapse
            className="mt-4"
            defaultActiveKey={engInstructionsCollapseKey}
          >
            <Panel
              header="Preparation instructions"
              key={engInstructionsCollapseKey}
            >
              <p>{drink.strInstructions}</p>
            </Panel>
            {drink.strInstructionsES && (
              <Panel header="Instrucciones de preparación" key={uuidv4()}>
                <p>{drink.strInstructionsES}</p>
              </Panel>
            )}
          </Collapse>
        </Card>
      </div>
    </ApplicationWrapper>
  );
};

export default PopularCocktailDetailPage;
