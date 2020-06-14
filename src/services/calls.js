import api from "./axios";

export const authentication = async (data) => {
  try {
    return await api.post("jwt-auth/v1/token", data);
  } catch (error) {
    console.log(error);

    return false;
  }
};

export const verify = async (number) => {
  try {
    const email = `${number}@gmail.com`;

    console.log(email);

    return await api.post("wp/v2/existuser", { email });
  } catch (error) {
    console.log(error);

    return false;
  }
};

export const createInforme = async (location, phone, obj, token) => {
  try {
    const { latitude: lat, longitude: lng } = location[0].coords;
    // const lat = -11.855673;
    // const lng = -55.510861;

    const { name, id } = obj;
    const responsaveis = `,${id},`;

    const resPoints = await api.post("wp/v2/coordenadas", {
      coordenadas: [lat, lng],
    });

    const [bool, checkin] = resPoints.data;

    if (bool) {
      const data = {
        title: "Aviso",
        status: "publish",
        acf: {
          name,
          contact: phone,
          responsaveis,
          coordenadas: {
            id: Number(id),
            phone,
            lat,
            lng,
            checkin,
          },
        },
      };
      await api.post("wp/v2/informes", data, {
        headers: { Authorization: "Bearer " + token },
      });
    } else {
      console.log(resPoints.data);
    }
  } catch (error) {
    console.log(error);

    return false;
  }
};
