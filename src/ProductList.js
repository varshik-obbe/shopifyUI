import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import {
  BlockStack,
  ResourceList,
  Avatar,
  Spinner,
  Button,
  Card,
  Icon,
  Badge,
  Page,
  FormLayout,
  TextField,
  Scrollable,
  Toast,
  ResourceItem,
  Text,
} from '@shopify/polaris';
import { SearchMajor } from '@shopify/polaris-icons';
import config from './config.json';

function ProductList() {
  let { id } = useParams();
  const [arr, setArr] = useState([]);
  const [customerId, setCustomerId] = useState(id);
  const [arrForSearch, setArrForSearch] = useState([]);
  const [btnLoader, setBtnLoader] = useState({});
  const [count, setCount] = useState(0);
  const [spinner, setSpinnerActive] = useState(false);
  const [successActive, setSuccessActive] = useState(false);
  const [errorActive, setErrorActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState();
  const [successMessage, setSuccessMessage] = useState();
  const [textFieldValue, setTextFieldValue] = useState('');

  const toggleSuccessActive = useCallback(() => setSuccessActive((active) => !active), []);
  const toggleErrorActive = useCallback(() => setErrorActive((active) => !active), []);

  const getData = useCallback(async () => {
    try {
      const response = await fetch(`${config.APIURL}/customerInventory/getProducts/`+customerId);
      const data = await response.json();
      setArr(data.products);
      setArrForSearch(data.products);
      let c = data.products.filter((product) => product.shopify_prod === 'yes').length;
      setCount(c);
    } catch (err) {
      handleFetchError();
    }
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  const handleFetchError = () => {
    setErrorMessage('Something went wrong');
    toggleErrorActive();
  };

  const handleButtonAction = async (item, actionType) => {
    let productData = {
      id: item.product_id,
      customer_id: customerId,
      shopify_product_id: item.shopify_prod_id,
      shopify_inventory_id: item.shopify_inventory_id,
    };
  
    try {
      setBtnLoader((prevLoadingState) => ({
        ...prevLoadingState,
        [item._id]: true,
      }));
  
      const endpoint = actionType === 'add' ? '/shopify/addProducts' : '/shopify/removeProduct';
      const response = await fetch(`${config.APIURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productData }),
      });
  
      const result = await response.json();
  
      if (result.global.success === 'updated data') {
        await getData();
        setSuccessMessage(`Product "${item.title}" ${actionType === 'add' ? 'added' : 'removed'} successfully.`);
        toggleSuccessActive();
      } else {
        handleFetchError();
      }
    } catch (err) {
      handleFetchError();
    } finally {
      setBtnLoader((prevLoadingState) => ({
        ...prevLoadingState,
        [item._id]: false,
      }));
    }
  };
  

  const renderMethodAllProduct = (item) => {
    const { _id, design_url, title, shopify_prod, price } = item;
    const media = <Avatar customer size="lg" source={design_url} name={title} />;

    return (
      <ResourceItem
        id={_id}
        url={design_url}
        media={media}
        accessibilityLabel={`View details for ${title}`}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between',gap:"20px",flexWrap: "wrap" }}>
          <div>
            <Text variant="bodyMd" fontWeight="bold" as="h3">
              {title}
            </Text>
            <div>Price: {price}Rs.</div>
          </div>
          <BlockStack inlineAlign="end">
            {btnLoader[_id] ? (
              <Button tone="critical" loading size="large" variant="tertiary">
                {shopify_prod === 'yes' ? 'Removing' : 'Adding'} Product
              </Button>
            ) : shopify_prod === 'yes' ? (
              <Button tone="critical" variant="tertiary" onClick={() => handleButtonAction(item, 'remove')}>
                Remove Product
              </Button>
            ) : (
              <Button tone="success" variant="subdued" onClick={() => handleButtonAction(item, 'add')}>
                Add Product
              </Button>
            )}
          </BlockStack>
        </div>
      </ResourceItem>
    );
  };

  const handleTextFieldChange = async (value) => {
    setTextFieldValue(value);
    setSpinnerActive(true);

    try {
      const regex = new RegExp(value, 'i');
      const filteredItems = arrForSearch.filter((item) => regex.test(item.title));
      setArr(filteredItems);
    } catch (error) {
      console.error('Error filtering items:', error);
    } finally {
      setTimeout(() => {
        setSpinnerActive(false);
      }, 1000);
    }
  };

  const handleClearButtonClick = () => {
    setTextFieldValue('');
    handleTextFieldChange();
  };

  const toastSuccessMarkup = successActive ? (
    <Toast duration={2000} content={successMessage} onDismiss={toggleSuccessActive} />
  ) : null;

  const toastErrorMarkup = errorActive ? <Toast content={errorMessage} error onDismiss={toggleErrorActive} /> : null;

  return (
    <Page
      title={
        <div style={{ paddingBottom: '30px' }}>
          <Text variant="heading3xl" as="h2">
            Products
          </Text>
        </div>
      }
      subtitle={
        <Text variant="headingLg" tone="subdued" as="h5">
          Add Printribe products to your store {count > 0 && <Badge tone="success">{count} products Added</Badge>}
        </Text>
      }
    >
      <Card roundedAbove="xs" padding={'1000'}>
        <FormLayout>
          <FormLayout.Group>
            <TextField
              value={textFieldValue}
              onChange={handleTextFieldChange}
              clearButton={!spinner}
              suffix={spinner && <Spinner accessibilityLabel="Spinner example" size="small" />}
              prefix={<Icon source={SearchMajor} tone="base" />}
              placeholder="Search Products"
              onClearButtonClick={handleClearButtonClick}
              autoComplete="off"
            />
          </FormLayout.Group>

          <FormLayout.Group>
            <Scrollable style={{ height: '450px' }}>
              {arr.length > 0 ? (
                <ResourceList
                  resourceName={{ singular: 'customer', plural: 'customers' }}
                  items={arr}
                  renderItem={renderMethodAllProduct}
                />
              ) : (
                <FormLayout.Group>
                  <Text as="p" variant="heading2xl" tone="text-inverse" alignment="center">
                    <Text as="span">No Products Available</Text>
                  </Text>
                </FormLayout.Group>
              )}
            </Scrollable>
          </FormLayout.Group>
        </FormLayout>
      </Card>
      {toastErrorMarkup}
      {toastSuccessMarkup}
    </Page>
  );
}

export default ProductList;
