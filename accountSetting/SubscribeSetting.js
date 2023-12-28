function subscribeSetting() {
    const url = 'http://localhost:8000/api/subscription/account?target=account_uuid&account_uuid=05c2fd4b-2f54-404f-90c7-a3a98b293095';

    fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${getCookie('token')}` // Replace with your method to get the token
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        return Promise.all(data.subscriptions.map(subscription => 
            fetch(`http://localhost:8000/api/shop/?shop_uuid=${subscription.shop_uuid}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => response.json())
            .then(shopDetails => ({
                ...subscription,
                ...shopDetails 
            }))
        ));
    })
    .then(updatedSubscriptions => {
        const tableHtml = createTable(updatedSubscriptions);
        document.getElementById('content').innerHTML = tableHtml;
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('content').innerHTML = '<p>Error fetching subscription details.</p>';
    });
}

function createTable(subscriptions) {
    let table = '<table border="1">';
    table += '<tr><th>Shop Name</th><th>Shop Details</th><th>Action</th></tr>'; // Table headers

    subscriptions.forEach(subscription => {
        table += `<tr>`;
        table += `<td>${subscription.name}</td>`;
        table += `<td>${subscription.description}</td>`;
        table += `<td><button class="delete-button" onclick="deleteSubscription('${subscription.shop_uuid}')">Delete</button></td>`;
        table += `</tr>`;
    });

    table += '</table>';
    return table;
}

async function deleteSubscription(shopUuid) {
    try {
        const token = getCookie('token');
        const accountUuid = getCookie('account_uuid');
        const url = `http://localhost:8000/api/subscription/unsubscribe?shop_uuid=${shopUuid}&account_uuid=${accountUuid}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        console.log('Subscription deleted successfully');
        subscribeSetting();
    } catch (error) {
    }
}