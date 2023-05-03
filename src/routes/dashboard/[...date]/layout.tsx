import { Slot, component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { createClient } from 'microcms-js-sdk';
import type { ItemObject, SaleObject } from '~/types/sale';
import { calculateItemStats } from '~/utils/chart';

export const useSalesData = routeLoader$(async (requestEvent) => {
  const pathParams = requestEvent.params;
  const targetDate = pathParams.date || new Date().toISOString().slice(0, 10);

  const MICROCMS_SERVICE_DOMAIN =
    requestEvent.env.get('MICROCMS_SERVICE_DOMAIN') || '';
  const MICROCMS_API_KEY = requestEvent.env.get('MICROCMS_API_KEY') || '';
  const client = createClient({
    serviceDomain: MICROCMS_SERVICE_DOMAIN,
    apiKey: MICROCMS_API_KEY,
  });

  const data = await client.getList<SaleObject>({
    endpoint: 'sale',
    queries: {
      limit: 9999,
      filters: `createdAt[begins_with]${targetDate}`,
    },
  });

  const item = await client.getList<ItemObject>({
    endpoint: 'items',
    queries: {
      orders: '-price',
    },
  });

  const itemReport = item.contents.map((item) => {
    const calc = calculateItemStats(data, item.title);
    return {
      title: item.title,
      price: item.price,
      ...calc,
    };
  });

  return {
    data,
    item: itemReport,
  };
});

export default component$(() => {
  return (
    <>
      <Slot />
    </>
  );
});