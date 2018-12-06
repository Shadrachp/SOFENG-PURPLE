/**
 * Library for the log interface.
 *
 * @author Llyme
 * @dependencies client.js
**/
const mod_log = {};

spook.waitForChildren(_ => mod_relay.waitForDatabase(_ => {
	let sort = {
		_id: -1
	};

	mod_log.new = (case_id, log_space) => {
		let mod = {};

		mod.getNotBilled = _ =>
			mod_relay.Log.get(case_id, 0, 0, {
				billed: false
			}, {
				date: -1,
				time_start: -1
			});

		mod_datastore.init(log_space, 128, 64, {
			getter: (skip, limit) =>
				mod_relay.Log.get(case_id, skip, limit, null, sort),

			key: doc => doc._id,

			new: (doc, index) => {
				doc.date = new Date(doc.date);

				let root = doc.root = q("!div");

				if (doc.billed)
					root.setAttribute("billed", 1);

				if (index != null)
					log_space.insertBefore(
						root,
						log_space.childNodes[index]
					);
				else
					log_space.appendChild(root);

				root.addEventListener("click", _ =>
					root.getAttribute("expand") ?
					root.removeAttribute("expand") :
					root.setAttribute("expand", 1)
				);


				let time = doc.time_end - doc.time_start;
				[[
					"log_space_time",
					mod_info.stats_time_convert(
						doc.time_end - doc.time_start
					) || "<b style=color:var(--warning)>" +
						"NO ACCUMULATED TIME</b>"
				], [
					"log_space_date",
					doc.date.toLocaleDateString()
				], [
					"log_space_code",
					doc.codes.length ? doc.codes.map(doc =>
						"<label>" + doc.code + "</label>"
					).join("") : "<b>NO CODE</b>"
				]].forEach(t => {
					let v = q("!label class=" + t[0]);
					v.innerHTML = t[1];

					root.appendChild(v);
				});


				let div = q("!div");
				root.appendChild(div);

				let l = [[
					"log_space_range",
					"label",
					lemon.time.minutesToStandard(doc.time_start) +
						" to " +
						lemon.time.minutesToStandard(doc.time_end)
				], [
					"log_space_lawyer",
					"label",
					doc.lawyer.name ? "<label>Lawyer</label>" +
						doc.lawyer.name :
						"<label style=color:var(--warning)>No Lawyer" +
						"</label>"
				]];

				if (doc.description)
					l.push([
						"log_space_desc",
						"div",
						doc.description.replace(/\n/g, "<br>")
					]);

				l.forEach(t => {
					let v = q("!" + t[1] + " class=" + t[0]);
					v.innerHTML = t[2];

					div.appendChild(v);
				});

				return doc;
			},

			remove: doc => {
				doc.root.remove();

				return true;
			},

			move: (doc, index) => {
				if (index == null)
					log_space.appendChild(doc.btn);
				else
					log_space.insertBefore(
						doc.btn,
						log_space.childNodes[index]
					);
			},

			sort: (a, b) => a._id > b._id
		})(mod);

		return mod;
	};
}));

spook.return();
