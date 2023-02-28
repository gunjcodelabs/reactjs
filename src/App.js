import Header from './Header';
import SearchItem from "./SearchItem";
import AddItem from "./AddItem";
import Content from './Content';
import Footer from './Footer';
import { useState, useEffect } from "react";
import apiRequest from './apiRequest';

function App() {
	const API_URL = 'http://localhost:3500/items';

	const [items, setItems] = useState([]);
	const [newItem, setNewItem] = useState('');
	const [search, setSearch] = useState('');
	const [fetchError, setFetchError] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	/**
	 * Execute once on load time
	 */
	useEffect(() => {

		const fetchItems = async () => {
			try {
				const response = await fetch(API_URL);

				if (!response.ok) throw Error(`Did not receive expected data`);

				const listItems = await response.json();

				setItems(listItems);
				setFetchError(null);
			} catch (error) {
				setFetchError(error.message);
			} finally {
				setIsLoading(false);
			}
		}

		setTimeout(() => {
			(async () => await fetchItems())();
		}, 2000);
		
	}, []);

	/**
	 * Add new item by Api request
	 * @param {*} item 
	 */
	const addItem = async (item) => {
		// Create id
		const id = items.length ? items[items.length - 1].id + 1 : 1;
		
		// New object
		const _newItem = {
			id, checked: false, item
		};

		// Make copy of list items with newly pushed item
		const listItems = [...items, _newItem];

		// Set items state
		setItems(listItems);

		// Post request params
		const postOption = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(_newItem)
		};

		// Receive Post request response
		const result = await apiRequest(API_URL, postOption);

		// In case any error catch in api response show on UI by updating error state
		if (result) setFetchError(result);
	};

	/**
	 * Fired when user press checbox in list item
	 * @param {*} id 
	 */
	const handleCheck = async (id) => {
		// Update the state when user toggle the checkbox
		const listItems = items.map((item) => item.id === id ? { ...item, checked: !item.checked } : item);

		// Update items state
		setItems(listItems);

		// Create updated item object
		const updatedItem = listItems.filter((item) => item.id === id);

		// Patch request params
		const patchOptions = {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ checked: updatedItem[0].checked })
		};

		// Build api Url query params
		const reqUrl = `${API_URL}/${id}`;

		// Execute patch request
		const result = await apiRequest(reqUrl, patchOptions);

		// If any error then update error state
		if (result) setFetchError(result);
	};

	/**
	 * Execute when press delete option in list
	 * @param {*} id 
	 */
	const handleDelete = async (id) => {
		// Remove existing record from list
		const listItems = items.filter((item) => item.id !== id);

		// Update items state
		setItems(listItems);

		// Delete request params
		const deleteOptions = { method: 'DELETE' };

		// Build api Url query params
		const reqUrl = `${API_URL}/${id}`;

		// Execute delete request
		const result = await apiRequest(reqUrl, deleteOptions);

		// If any error then update error state
		if (result) setFetchError(result);
	};

	/**
	 * Trigger when Add new item form submit action fired
	 * @param {*} e 
	 * @returns 
	 */
	const handleSubmit = (e) => {
		// Stop complete page reloading when form submitted
		e.preventDefault();

		if (!newItem) return;

		// Post new item
		addItem(newItem);

		// Set form state as clear state
		setNewItem('');
	};

	/**
	 * JSX
	 */
	return (
		<div className="App">
			<Header title="Grocery List" />
			<AddItem
				newItem={newItem}
				setNewItem={setNewItem}
				handleSubmit={handleSubmit}
			/>
			<SearchItem
				search={search}
				setSearch={setSearch}
			/>
			<main>
				{isLoading && <p>Loading items...</p>}
				{fetchError && <p style={{ color: "red" }}>{`Error: ${fetchError}`}</p>}
				{!fetchError && !isLoading && <Content
					items={items.filter((item) => (item.item).toLowerCase().includes(search.toLowerCase()))}
					handleCheck={handleCheck}
					handleDelete={handleDelete}
				/>}
			</main>
			<Footer length={items.length} />
		</div>
	);
}

export default App;
