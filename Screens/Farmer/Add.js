import React from "react";
import AddWheatBatch from "../Shared/AddWheatBatch";

const AddFarmer = ({ navigation }) => (
	<AddWheatBatch
		navigation={navigation}
		idLabelKey="farmerId"
		headerKey="addFarmer"
		submitLabelKey="addFarmer"
		validateScreen="ValidFarmer"
	/>
);

export default AddFarmer;
