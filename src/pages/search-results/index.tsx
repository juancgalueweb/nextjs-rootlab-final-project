import type { PaginationProps } from 'antd';
import { Pagination } from 'antd';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { getPlaiceholder } from 'plaiceholder';
import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CocktailsByIngCard } from '../../components/CocktailsByIng/CocktailByIngCard';
import { ApplicationWrapper } from '../../components/layout/ApplicationWrapper';
import { ICocktailsByIng } from '../../global/ICocktailsByIng';
import { fetchCocktailsByIng } from '../api/getCocktailsByIng';
interface TProps {
  drinks: ICocktailsByIng[];
  ingredient: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const ingredient = context.query['ingredient'] as string;
  const fetchedDrinks = await fetchCocktailsByIng(ingredient);
  const drinks = await Promise.all(
    fetchedDrinks.map(async (drink) => {
      const { base64, img } = await getPlaiceholder(drink.strDrinkThumb);
      return { ...drink, base64, img };
    })
  );
  return {
    props: { drinks, ingredient },
  };
};

const CocktailsByIngSearchResult: NextPage<TProps> = ({
  drinks,
  ingredient,
}) => {
  const router = useRouter();
  const titleMessage = `Cocktails with ${ingredient}`;
  const descriptionMessage = 'Results of the cocktails by searched ingredient';
  const [current, setCurrent] = useState(1);

  const chunks = useCallback((allDrinks: ICocktailsByIng[]) => {
    let newArray: ICocktailsByIng[] = [];
    const finalArray: ICocktailsByIng[][] = [];
    if (allDrinks.length <= 10) {
      finalArray.push(allDrinks);
    } else {
      allDrinks.forEach((drink, idx) => {
        newArray.push(drink);
        if ((idx + 1) % 10 === 0) {
          finalArray.push(newArray);
          newArray = [];
        } else if (idx === allDrinks.length - 1 && newArray.length !== 0) {
          finalArray.push(newArray);
        }
      });
    }
    return finalArray;
  }, []);

  const [dataToShow, setDataToShow] = useState(chunks(drinks)[0]);
  const onChange: PaginationProps['onChange'] = (page) => {
    setDataToShow(chunks(drinks)[page - 1]);
    setCurrent(page);
    router.replace(
      {
        query: { ...router.query, page: page },
      },
      undefined,
      { shallow: true }
    );
  };

  useEffect(() => {
    const prevPageArray = window.history.state.url.split('=');
    const pageNumber = +prevPageArray[prevPageArray.length - 1];
    if (pageNumber !== 1) {
      setDataToShow(chunks(drinks)[pageNumber - 1]);
      setCurrent(pageNumber);
    } else {
      setDataToShow(chunks(drinks)[0]);
      setCurrent(1);
    }
  }, [drinks, chunks]);

  return (
    <ApplicationWrapper title={titleMessage} description={descriptionMessage}>
      <div className='flex flex-col justify-center items-center p-6 bg-slate-200'>
        <h1 className='text-4xl pb-6 font-semibold text-transparent bg-clip-text bg-gradient-to-br from-zinc-800 to-zinc-600'>
          Cocktails made of {ingredient}
        </h1>
        <ul className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5 mb-3'>
          {dataToShow.map((drink) => (
            <CocktailsByIngCard key={uuidv4()} drink={drink} />
          ))}
        </ul>
        <Pagination
          hideOnSinglePage
          simple
          pageSize={10}
          current={current}
          onChange={onChange}
          total={drinks.length}
        />
      </div>
    </ApplicationWrapper>
  );
};

export default CocktailsByIngSearchResult;
