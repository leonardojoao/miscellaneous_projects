import { useGlobalContext } from '../../../shared/hooks/useGlobalContext';

const Product = () => {
  const { user } = useGlobalContext();
  console.log(user);

  return <div>{JSON.stringify(user)}</div>;
};

export default Product;
