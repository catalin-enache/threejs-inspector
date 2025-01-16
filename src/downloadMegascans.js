// bz0yNA== start

// a page has 24 items
// last cursor bz01MDI0

// problems at:
// bz02MDA=
// bz02NDg=
// bz0xNTYw
// bz0yMjU2
//
//
//
(async function work() {
  const FETCH_DELAY = 1000;
  let hasError = false;

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(';').shift();
    }
    return null;
  }

  console.log('CSRF Token:', getCookie('sb_csrftoken'));

  // (211 + 92 + 164 + 133 + 21) * 24 = 14904
  async function search(cursor) {
    // let url = `https://www.fab.com/i/listings/search?currency=USD&seller=Quixel&sort_by=listingTypeWeight`; // 211 pages // sort_by=listingTypeWeight -relevance -averageRating -createdAt
    // let url = `https://www.fab.com/i/listings/search?currency=USD&listing_types=material&seller=Quixel&sort_by=createdAt`; // 211 pages
    // let url = `https://www.fab.com/i/listings/search?currency=USD&listing_types=decal&seller=Quixel&sort_by=createdAt`; // 92 pages
    // let url = `https://www.fab.com/i/listings/search?currency=USD&listing_types=3d-model&seller=Quixel&sort_by=-relevance`; // 164 pages
    // let url = `https://www.fab.com/i/listings/search?currency=USD&listing_types=atlas&seller=Quixel&sort_by=createdAt`; // 133 pages
    let url = `https://www.fab.com/i/listings/search?currency=USD&listing_types=brush&seller=Quixel&sort_by=createdAt`; // 21 pages
    if (cursor) {
      url += `&cursor=${encodeURI(cursor)}`;
    }
    const response = await fetch(url);
    const data = await response.json();
    const { next } = data.cursors;
    const results = data.results;
    const uids = results.map((result) => result.uid);
    localStorage.setItem('lastCursor', cursor);
    return { uids, next };
  }

  async function notAcquiredContent(uids) {
    const baseUrl = 'https://www.fab.com/i/users/me/acquired-content';
    const url = `${baseUrl}?` + uids.map((id) => `listing_ids=${id}`).join('&');
    const response = await fetch(url);
    const data = await response.json();
    return data.filter((item) => !item.acquired).map((item) => item.uid);
  }

  async function fetchLicenses(ids) {
    // console.log('Fetching licenses for:', ids);
    const offerIDs = {}; // Array to store the ID-to-response mapping

    for (const id of ids) {
      try {
        const url = `https://www.fab.com/i/listings/${id}`;
        const response = await fetch(url);
        const data = await response.json();
        await new Promise((resolve) => setTimeout(resolve, FETCH_DELAY)); // Wait for 1 second
        const license = data.licenses.find((license) => license.name === 'Professional'); // Personal | Professional
        offerIDs[id] = license.offerId;
      } catch (error) {
        hasError = true;
        console.error(`Failed to fetch data for ID ${id}:`, error);
      }
    }

    // Return the array of ID-to-response mappings
    return offerIDs;
  }

  async function addToLibrary(offerIDs) {
    let count = Object.keys(offerIDs).length;
    for await (const [id, offerId] of Object.entries(offerIDs)) {
      try {
        const url = `https://www.fab.com/i/listings/${id}/add-to-library`;
        const formData = new FormData();
        formData.append('offer_id', offerId);
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            // referer header is required to add the license to the library
            Referer: `https://www.fab.com/listings/${id}`, // Use the correct referer URL
            'x-csrftoken': getCookie('fab_csrftoken') // sb_csrftoken, fab_csrftoken
          },
          body: formData
        });

        // if (!response.ok) {
        //   throw new Error(`Server responded with status ${response.status}`);
        // }

        await new Promise((resolve) => setTimeout(resolve, FETCH_DELAY)); // Wait for 1 second
        console.log(`Added license to library for ID ${id} - remaining: ${--count}`);
      } catch (error) {
        console.error(`Failed to add license to library for ID ${id}:`, error);
        hasError = true;
        break;
      }
    }
  }

  let totalPages = +(localStorage.getItem('totalPages') || '1');
  let nextCursor = localStorage.getItem('lastCursor'); // || 'bz0yNA=='; // 'cj0xJnA9Tm9uZQ==' / 'bz0yNA==';

  while (true) {
    if (hasError) {
      console.log('Error occurred, stopping the process');
      break;
    }

    const { uids, next } = await search(nextCursor);
    console.log(`Processing page ${totalPages} at cursor ${nextCursor}`);

    if (!next || next === localStorage.getItem('lastCursor')) {
      console.log('No more pages to process');
      break;
    }

    localStorage.setItem('totalPages', totalPages.toString());
    const notAcquiredIds = await notAcquiredContent(uids);
    console.log(`Not acquired: ${notAcquiredIds.length} for page ${totalPages} at cursor ${nextCursor}`);
    const offerIDs = await fetchLicenses(notAcquiredIds);
    await addToLibrary(offerIDs);

    // console.log({ uids, next, response: notAcquiredIds });
    await new Promise((resolve) => setTimeout(resolve, FETCH_DELAY));

    nextCursor = next;
    totalPages++;
  }
})();
